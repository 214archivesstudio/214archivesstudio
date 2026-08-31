// handoff/admin-data.js — mock data for the admin mockups

window.ADMIN_USER = {
  name: "Yejin Lee",
  email: "studio@214archives.com",
  role: "Owner",
};

window.ADMIN_NAV = [
  { label: "대시보드", href: "dashboard" },
  { label: "포스트",   href: "posts" },
  { label: "미디어",   href: "media" },
  { label: "팀",       href: "team" },
];

window.ADMIN_SECTIONS = [
  { id: "showreel",    label: "Showreel",      count: 1  },
  { id: "archives",    label: "Archives",      count: 13 },
  { id: "film",        label: "Film",          count: 6  },
  { id: "photography", label: "Photography",   count: 6  },
  { id: "personal",    label: "Personal Work", count: 2  },
];

window.ADMIN_STATS = [
  { label: "포스트",         value: "47", note: "게시 32 · 초안 15" },
  { label: "미디어 자산",     value: "1,284", note: "이번 달 +42" },
  { label: "마지막 게시",     value: "2시간 전", note: "Yejin · Archives · TAIPEI '24" },
  { label: "동기화 상태",     value: "변경 3건", note: "supabase → vercel" },
];

window.ADMIN_JOBS = [
  { id: 1, time: "14:22",      type: "publish",  target: "Archives · TAIPEI '24",     status: "success", by: "Yejin" },
  { id: 2, time: "12:08",      type: "media",    target: "lookbook-cau-fashion · +6", status: "success", by: "Yejin" },
  { id: 3, time: "11:51",      type: "draft",    target: "Personal · About Me",       status: "pending", by: "Yejin" },
  { id: 4, time: "어제 18:42",  type: "publish",  target: "Film · Spring Editorial",   status: "success", by: "Yejin" },
  { id: 5, time: "어제 17:30",  type: "delete",   target: "Photography · old draft",   status: "success", by: "Yejin" },
  { id: 6, time: "어제 09:14",  type: "publish",  target: "Archives · NEWYORK '25",    status: "success", by: "Yejin" },
];

window.ADMIN_POSTS = [
  { id: "24-taipei",            section: "Archives",      title: "TAIPEI '24",                date: "2025.07.04", status: "published", count: 26 },
  { id: "f-2025-spring",        section: "Film",          title: "Spring Editorial",          date: "2025.04.18", status: "published", count: 1  },
  { id: "lookbook-cau-fashion", section: "Photography",   title: "LookBook · CAU Fashion",    date: "2025.02.10", status: "published", count: 7  },
  { id: "25-tokyo",             section: "Archives",      title: "Tokyo '25",                 date: "2025.06.18", status: "published", count: 15 },
  { id: "25-miyakojima",        section: "Archives",      title: "MIYAKOJIMA '25",            date: "2025.04.12", status: "published", count: 13 },
  { id: "25-newyork",           section: "Archives",      title: "NEWYORK '25",               date: "2024.08.30", status: "published", count: 53 },
  { id: "f-2024-look",          section: "Film",          title: "AW24 Lookbook Film",        date: "2024.11.02", status: "published", count: 1  },
  { id: "lookbook-bready",      section: "Photography",   title: "Product · B.Ready",         date: "2024.11.17", status: "published", count: 4  },
  { id: "pony-project",         section: "Personal Work", title: "PONY Project",              date: "2024.05.10", status: "published", count: 7  },
  { id: "draft-iceland",        section: "Archives",      title: "ICELAND '25 (작성중)",        date: "2025.05.21", status: "draft",     count: 9  },
  { id: "draft-2026-reel",      section: "Showreel",      title: "2026 Showreel (작성중)",      date: "2026.04.02", status: "draft",     count: 0  },
];

window.ADMIN_TEAM = [
  { name: "Yejin Lee",   role: "Owner · Director",        email: "yejin@214archives.com", lastSeen: "활성" },
  { name: "Minho Park",  role: "Editor · Cinematographer", email: "minho@214archives.com", lastSeen: "3시간 전" },
  { name: "Soo Kim",     role: "Contributor · Stylist",    email: "soo.k@214archives.com", lastSeen: "이틀 전" },
];

// Same gradient generator as the public-site kit, so admin previews match
const PALETTES = [
  ['#c97a3a','#6a3018','#1c0d08'],
  ['#4a5a78','#1f2532','#0a0d13'],
  ['#d6c4a8','#75614a','#211712'],
  ['#5a5a5a','#2a2a2a','#0d0d0d'],
  ['#5e8a86','#2a4844','#0a1614'],
  ['#7a6b8a','#3a2f4a','#0e0a14'],
  ['#b8704a','#5a3020','#1a0b07'],
  ['#7aa8c0','#2a4858','#08141c'],
  ['#a89880','#5a4e3f','#1c1813'],
  ['#b8c8b0','#4a5e48','#0d1a0c'],
];
function hashCode(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); }
window.imageFor = function (id, variant = 0) {
  const h = hashCode(String(id) + ':' + variant);
  const p = PALETTES[h % PALETTES.length];
  const fx = 20 + (h % 60);
  const fy = 20 + ((h >> 8) % 60);
  return `radial-gradient(120% 80% at ${fx}% ${fy}%, ${p[0]} 0%, ${p[1]} 55%, ${p[2]} 100%)`;
};
