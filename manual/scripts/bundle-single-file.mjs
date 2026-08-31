#!/usr/bin/env node
// 단일 파일 번들러 — dist/ (VitePress 빌드 결과) → 오프라인 단일 HTML.
// 알고리즘: docs/admin-manual-implementation-plan.md §5.1 / docs/handoff-admin-manual.md §2.4.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { sidebar } from '../docs/.vitepress/sidebar.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const MIN_IMAGES = 27;
const MAX_BYTES = 10 * 1024 * 1024;

const MIME_BY_EXT = {
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const REMOVE_SELECTORS = [
  '.VPDocAside', '.VPDocFooter', '.VPNavBarSearch', '.VPLocalNav',
  '.VPNavBarMenu', '.VPNavBarExtra', '.VPNavBarHamburger',
  '.VPNavBarAppearance', '.VPNavBarSocialLinks', '.VPSkipLink',
  '.VPBackdrop', '.VPNavScreen',
].join(',');

const SCROLL_SPY = `(function(){var links=[].slice.call(document.querySelectorAll('.VPSidebar a[href^="#page-"]'));
var byId={};links.forEach(function(a){byId[a.getAttribute('href').slice(1)]=a.closest('.VPSidebarItem');});
function mark(id){links.forEach(function(a){a.closest('.VPSidebarItem').classList.remove('is-active');});var it=byId[id];if(it)it.classList.add('is-active');}
var sections=[].slice.call(document.querySelectorAll('section.page'));
function onScroll(){var y=window.scrollY+100,cur=sections[0];sections.forEach(function(s){if(s.offsetTop<=y)cur=s;});var atBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2;if(atBottom)cur=sections[sections.length-1];if(cur)mark(cur.id);}
window.addEventListener('scroll',onScroll,{passive:true});links.forEach(function(a){a.addEventListener('click',function(){mark(a.getAttribute('href').slice(1));});});onScroll();})();`;

function distFilePath(relHref) {
  const abs = path.join(DIST_DIR, relHref.replace(/^\//, ''));
  if (!existsSync(abs)) throw new Error(`dist 파일 없음: ${relHref} (${abs})`);
  return abs;
}

function toDataUri(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) throw new Error(`알 수 없는 MIME 타입: ${absPath}`);
  return `data:${mime};base64,${readFileSync(absPath).toString('base64')}`;
}

function inlineFontUrls(cssText) {
  return cssText.replace(/url\((\/assets\/[^)]+\.woff2)\)/g, (_, href) => `url(${toDataUri(distFilePath(href))})`);
}

const slugOf = (route) => route.replace(/^\//, '').replace(/\//g, '-');

function flattenRoutes(groups) {
  return groups.flatMap((group) => group.items.map((item) => item.link));
}

function resolveBodyHref(href, currentRoute) {
  if (!href || href.startsWith('data:') || href.startsWith('#') || href.startsWith('mailto:')) return null;
  if (/^(https?:)?\/\//.test(href)) return null;
  const [pathPart, hash] = href.split('#');
  const resolved = path.posix.resolve(path.posix.dirname(currentRoute), pathPart).replace(/\.html$/, '');
  const slug = slugOf(resolved);
  return hash ? `#${slug}--${hash}` : `#page-${slug}`;
}

function rewritePageBody($, body, route) {
  const slug = slugOf(route);
  body.find('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]').each((_, el) => {
    $(el).attr('id', `${slug}--${$(el).attr('id')}`);
  });
  body.find('a.header-anchor').each((_, el) => {
    $(el).attr('href', `#${slug}--${$(el).attr('href').slice(1)}`);
  });
  body.find('a[href]').each((_, el) => {
    const resolved = resolveBodyHref($(el).attr('href'), route);
    if (resolved) $(el).attr('href', resolved);
  });
  body.find('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:')) $(el).attr('src', toDataUri(distFilePath(src)));
  });
}

function buildPageSection(route) {
  const $ = cheerio.load(readFileSync(distFilePath(`${route}.html`), 'utf8'));
  const body = $('main.main .vp-doc > div').first();
  if (body.length === 0) throw new Error(`본문 래퍼(main.main .vp-doc > div)를 찾을 수 없음: ${route}`);
  rewritePageBody($, body, route);
  return `<section class="page" id="page-${slugOf(route)}"><div>${body.html()}</div></section>`;
}

function inlineStylesheets($) {
  $('link[href$=".css"]').each((_, el) => {
    const href = $(el).attr('href');
    const css = inlineFontUrls(readFileSync(distFilePath(href), 'utf8'));
    $(el).replaceWith(`<style>${css}</style>`);
  });
}

function stripRuntime($) {
  $('script').remove();
  $('link[rel="modulepreload"],link[rel="preload"]').remove();
  $(REMOVE_SELECTORS).remove();
  $('.VPSidebarItem.collapsed').removeClass('collapsed');
}

function inlineIconAndLogo($) {
  $('link[rel="icon"]').attr('href', (_, href) => toDataUri(distFilePath(href)));
  $('.VPNavBarTitle img.logo').attr('src', (_, src) => toDataUri(distFilePath(src)));
  $('.VPNavBarTitle a.title').attr('href', '#');
}

function rewriteSidebarLinks($) {
  $('.VPSidebar a[href]').each((_, el) => {
    const href = $(el).attr('href').replace(/\.html$/, '');
    $(el).attr('href', `#page-${slugOf(href)}`);
  });
}

function assembleShell($, sectionsHtml, siteTitle) {
  $('title').text(siteTitle);
  $('main.main .vp-doc > div').first().replaceWith(sectionsHtml);
  $('body').append(`<script>\n${SCROLL_SPY}\n</script>`);
}

function selfCheck($, expectedPages) {
  const errors = [];
  if ($('script').length !== 1) errors.push(`<script> 1개여야 함, 실제 ${$('script').length}`);
  if ($('link').length !== 1) errors.push(`<link> 1개여야 함, 실제 ${$('link').length}`);
  $('link,script,img').each((_, el) => {
    for (const attr of ['src', 'href']) {
      const v = $(el).attr(attr);
      if (v && /^(https?:)?\/\//.test(v)) errors.push(`외부 ${attr}: <${el.tagName}> ${v}`);
    }
  });
  const pages = $('section.page').length;
  if (pages !== expectedPages) errors.push(`section.page ${expectedPages}개여야 함, 실제 ${pages}`);
  const imgs = $('img').length;
  if (imgs < MIN_IMAGES) errors.push(`img ${MIN_IMAGES}개 이상이어야 함, 실제 ${imgs}`);
  return errors;
}

function main() {
  const outArg = process.argv[2];
  if (!outArg) throw new Error('사용법: node bundle-single-file.mjs <출력경로>');
  const outPath = path.resolve(process.cwd(), outArg);

  const routes = flattenRoutes(sidebar);
  const sectionsHtml = routes.map(buildPageSection).join('\n');

  const $ = cheerio.load(readFileSync(distFilePath(`${routes[0]}.html`), 'utf8'));
  const siteTitle = $('title').text().split(' | ').pop();

  inlineStylesheets($);
  stripRuntime($);
  inlineIconAndLogo($);
  rewriteSidebarLinks($);
  assembleShell($, sectionsHtml, siteTitle);

  const output = $.html();
  const bytes = Buffer.byteLength(output, 'utf8');
  const errors = selfCheck($, routes.length);
  if (bytes > MAX_BYTES) errors.push(`출력 크기 ${(bytes / 1024 / 1024).toFixed(2)} MB > 10 MB`);

  if (errors.length > 0) {
    console.error('자체 검증 실패:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  writeFileSync(outPath, output);
  console.log(`pages: ${routes.length}`);
  console.log(`images: ${$('img').length}`);
  console.log(`bytes: ${bytes} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`output: ${outPath}`);
}

main();
