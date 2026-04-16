# LJH Notes

一个基于 `Astro + MDX` 的静态博客，面向 GitHub Pages 部署。

## 本地开发

```bash
npm install
npm run dev
```

常用命令：

- `npm run dev`：启动本地开发服务器
- `npm run check`：运行 Astro 类型与内容检查
- `npm run build`：构建静态站点
- `npm run preview`：本地预览构建产物
- `npm run publish`：执行发布前检查与构建，成功后再 `git push`

## 内容结构

- `src/content/blog/`：文章内容
- `src/pages/`：页面和静态数据接口
- `src/components/`：布局与复用组件
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署

## 写新文章

在 `src/content/blog/` 下新增 `.mdx` 文件，并提供以下 frontmatter：

```md
---
title: 标题
description: 摘要
pubDate: 2026-04-16
tags:
  - 示例
draft: false
---
```

## GitHub Pages

工作流默认在推送 `main` 分支后自动构建并部署。`astro.config.mjs` 会在 GitHub Actions 中自动推导项目页的 `base` 路径；如果后续改用自定义域名，可以通过 `SITE_URL` 和 `BASE_PATH` 环境变量覆盖默认值。

## 最简发布流程

1. 在 `src/content/blog/` 写完文章
2. 将 frontmatter 中的 `draft` 改为 `false`
3. 运行 `npm run publish`
4. 执行 `git push`
