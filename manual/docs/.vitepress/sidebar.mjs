export const sidebar = [
  {
    text: '시작하기',
    items: [
      { text: '접속과 로그인', link: '/start/0-login' },
      { text: '화면 구성', link: '/start/1-layout' },
      { text: '공개·초안과 게시의 차이', link: '/start/2-publish-model' },
    ],
  },
  {
    text: '공통 조작',
    items: [
      { text: '새 게시물 만들기', link: '/common/0-create' },
      { text: '갤러리 사진 넣기·순서·설명', link: '/common/1-gallery' },
      { text: '수정하기', link: '/common/2-edit' },
      { text: '공개 / 초안 바꾸기', link: '/common/3-visibility' },
      { text: '사이트에 내보내기(게시)', link: '/common/4-publish' },
      { text: '삭제하기', link: '/common/5-delete' },
    ],
  },
  {
    text: '카테고리별 등록',
    items: [
      { text: 'Showreel', link: '/category/showreel' },
      { text: 'Archives', link: '/category/archives' },
      { text: 'Film', link: '/category/film' },
      { text: 'Photography', link: '/category/photography' },
      { text: 'Personal', link: '/category/personal' },
    ],
  },
  {
    text: '운영 시나리오',
    items: [{ text: '운영 시나리오', link: '/scenarios/index' }],
  },
  {
    text: '주의사항 및 문제 해결',
    items: [{ text: '주의사항 및 문제 해결', link: '/troubleshooting/index' }],
  },
  {
    text: '게시 전 체크리스트',
    items: [{ text: '게시 전 체크리스트', link: '/checklist/index' }],
  },
];
