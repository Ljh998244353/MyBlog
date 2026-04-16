export const siteConfig = {
  title: 'LJH Notes',
  description: '一个用 Astro 构建的静态博客，用来记录技术实践、写作流程与长期项目笔记。',
  author: 'LJH',
  siteUrl: 'https://example.github.io',
  navigation: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/posts/' },
    { label: '标签', href: '/tags/' },
    { label: '搜索', href: '/search/' },
    { label: '关于', href: '/about/' }
  ]
} as const;
