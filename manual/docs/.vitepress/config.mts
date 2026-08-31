import { defineConfig } from 'vitepress';
import { sidebar } from './sidebar.mjs';
// @ts-expect-error — 타입 선언 없음
import taskLists from 'markdown-it-task-lists';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'ko-KR',
  title: '214 Archives 어드민 가이드',
  description: '214archives.com 관리자 페이지 사용 설명서',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  base: '/',
  outDir: '../dist',
  srcExclude: ['AGENTS.md'],
  markdown: {
    // 게시 전 체크리스트의 `- [ ]` 를 체크박스로 렌더
    config: (md) => { md.use(taskLists); },
  },
  appearance: false,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    search: {
      provider: 'local',
    },

    nav: [{ text: '사용 가이드', link: '/start/0-login' }],

    sidebar,

    outline: false,
    docFooter: { prev: false, next: false },

    socialLinks: [],
  },
});
