# 博客使用说明

这是一个基于 `Astro + MDX` 的静态博客仓库，默认部署到 GitHub Pages。后续你主要会做三类事情：

1. 写新文章并发布
2. 调整站点文案或导航
3. 做一些简单的样式和排版微调

## 先知道这几个目录

- `src/content/blog/`：文章正文，后续发博客最常用
- `src/pages/`：页面结构，例如首页、文章归档、文章详情、标签页
- `src/components/`：可复用组件，例如文章卡片、目录、头部
- `src/styles/global.css`：全局样式，改颜色、字体、间距通常看这里
- `src/config/site.ts`：站点标题、描述、导航、首页那句文案
- `src/content.config.ts`：文章 frontmatter 结构校验
- `scripts/publish.mjs`：发布前检查脚本

## 环境与常用命令

要求 Node 版本 `>= 22.12.0`。

首次启动：

```bash
npm install
npm run dev
```

常用命令：

- `npm run dev`：本地开发预览
- `npm run check`：检查文章内容和路由是否有效
- `npm run build`：生成静态站点到 `dist/`
- `npm run preview`：本地预览构建结果
- `npm run publish`：按顺序执行 `check` + `build`

注意：`npm run publish` 只做发布前检查，不会自动推送代码。

## 后续发博客的完整流程

### 1. 新建文章

在 `src/content/blog/` 下新建一个 `.md` 或 `.mdx` 文件。文件名会直接影响文章 URL，建议使用英文 kebab-case，例如：

```bash
src/content/blog/my-new-post.mdx
```
我可以直接帮你把项目改成“支持 blog 下子目录放 mdx 文件”的版本。
最少需要这些 frontmatter：

```md
---
title: 标题
description: 一句话摘要
pubDate: 2026-04-16
tags:
  - 示例
draft: true
---
```

可选字段：

- `updatedDate`：文章更新日期
- `cover`：封面图路径

### 2. 本地预览

写完后运行：

```bash
npm run dev
```

如果只是检查内容和构建是否正常，也可以运行：

```bash
npm run check
npm run build
```

### 3. 准备发布

确认文章没问题后，把 frontmatter 里的：

```md
draft: false
```

然后执行：

```bash
npm run publish
```

这一步会先校验内容，再构建静态站点。只要这一步通过，说明仓库已经具备发布条件。

### 4. 推送并触发部署

执行：

```bash
git add .
git commit -m "add new post"
git push
```

推送到 `main` 后，GitHub Actions 会自动部署到 GitHub Pages。

## 做简单修改时最少要知道的信息

### 1. 只想发文章

只需要关注：

- `src/content/blog/`
- `src/content.config.ts`

通常你只写文章文件本身，不需要动组件和页面。

### 2. 想改站点标题、导航、首页文案

改 `src/config/site.ts`：

- `title`：站点标题
- `description`：站点描述和部分 SEO 文案
- `heroLine`：首页头像下方那句文案
- `navigation`：顶部导航
- `siteUrl`：站点正式地址

### 3. 想改页面布局

常用入口：

- `src/pages/index.astro`：首页
- `src/pages/posts/index.astro`：文章归档页
- `src/pages/posts/[slug].astro`：文章详情页
- `src/components/PostCard.astro`：文章列表卡片

### 4. 想改颜色、字号、间距、代码块样式

优先改：

```bash
src/styles/global.css
```

大多数简单视觉优化都集中在这里，不要先去多个组件里重复写样式。

## 部署与配置补充

默认部署目标是 GitHub Pages。`astro.config.mjs` 会根据 GitHub Actions 环境自动推导 `site` 和 `base`。如果以后改成自定义域名或其他部署路径，需要重点看：

- `astro.config.mjs`
- `.github/workflows/deploy.yml`

## 最短发布版清单

如果你以后只想快速回忆最短流程，记下面这 6 步：

1. 在 `src/content/blog/` 新建 `.mdx` 文章
2. 写好 `title / description / pubDate / tags / draft`
3. 本地 `npm run dev` 预览
4. 把 `draft` 改成 `false`
5. 运行 `npm run publish`
6. `git push`，等待 GitHub Pages 自动部署
