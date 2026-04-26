# liu_jh の Blog

这是一个基于 Astro + GitHub Pages 的静态博客，用于长期维护课程笔记、技术文章和个人学习记录。当前界面以 Momo 模板为基础改造，保留文章卡片、推荐阅读、最近更新、多标签归档、MDX 写作和自动封面图库；评论功能和友链页面已经删除。

## 免费架构说明

这个仓库的日常使用目标是 0 成本：

- Astro 在本地或 GitHub Actions 中把文章构建成静态 HTML、CSS 和 JavaScript。
- GitHub Pages 托管构建后的 `dist/` 静态文件，不需要服务器、数据库或后端接口。
- GitHub Actions 在公共仓库中使用标准 GitHub-hosted runner 构建和部署；GitHub 官方文档说明公共仓库标准 runner 免费使用。
- Pagefind 在构建时生成本地搜索索引，搜索运行在浏览器端，不需要外部搜索服务。
- MDX、Svelte、Tailwind CSS、Astro 集成和脚本都只是项目依赖，不会按访问量计费。

需要注意的是，免费不等于无限制。GitHub Pages 官方限制包括：发布后的站点大小不超过 1GB、源仓库建议不超过 1GB、部署超过 10 分钟会超时、站点每月有 100GB 软带宽限制。普通个人博客通常远低于这些限制。

官方参考：

- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Actions billing and usage](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration)

## 项目结构

```text
.
├── .github/workflows/        GitHub Actions 构建与 Pages 部署
├── public/                   静态资源，会原样发布
│   └── covers/gallery/       自动文章封面图库
├── scripts/                  本地辅助脚本
│   ├── fill-post-dates.mjs   自动补全空的 pubDatetime
│   ├── preview.mjs           本地生产预览
│   ├── publish.mjs           发布前检查脚本
│   └── sync-post-covers.mjs  自动封面分配脚本
├── src/
│   ├── components/           Astro/Svelte 组件
│   │   └── mdx/              MDX 专用组件
│   ├── data/blog/            博客文章，支持 .md 和 .mdx
│   ├── data/cover-assignments.json
│   ├── layouts/              页面与文章布局
│   ├── pages/                路由、RSS、robots、OG 端点
│   ├── styles/               全局样式与深色模式配色
│   └── utils/                文章、路径、时间等工具
├── astro.config.ts           Astro、MDX、Svelte、Sitemap、Markdown 配置
├── package.json              依赖与 npm 脚本
└── README.md                 当前帮助文档
```

## 核心工具

- `Astro`：静态站点生成器，负责把 `src/data/blog/` 中的文章构建成页面。
- `@astrojs/mdx`：让文章支持 `.mdx`，可以在 Markdown 中使用 Astro/Svelte 组件。
- `@astrojs/svelte`：支持少量需要交互的 Svelte 组件，例如归档筛选。
- `Tailwind CSS`：样式工具，当前项目也保留了全局 CSS 变量用于浅色/深色模式。
- `Pagefind`：构建后生成搜索索引，部署时不需要后端。
- `GitHub Actions`：推送到 `main` 后自动安装依赖、构建并上传 Pages artifact。
- `GitHub Pages`：托管静态站点。

## 本地环境

要求 Node `>=22.12.0`。仓库里有 `.nvmrc`，使用 nvm 时可以执行：

```bash
nvm use
npm install
npm run dev
```

默认开发地址是：

```text
http://localhost:4321
```

## 常用命令

```bash
npm run dev
npm run check
npm run build
npm run preview
npm run publish
```

- `npm run dev`：启动本地开发服务器。启动前会自动补文章发布时间并同步封面分配。
- `npm run check`：执行 Astro 类型检查与内容校验。运行前会执行 `prepare:content`。
- `npm run build`：生产构建，生成 `dist/`，并用 Pagefind 生成搜索索引。
- `npm run preview`：本地预览生产构建结果。
- `npm run publish`：发布前检查脚本，会依次执行 `npm run check` 和 `npm run build`。

注意：这里的发布脚本是 `npm run publish`，不是 `npm publish`。`npm publish` 是把包发布到 npm registry 的命令，本博客日常发布不要执行它。

## 日常发布流程

1. 在 `src/data/blog/` 下新增或修改文章。
2. 本地执行 `npm run dev`，在浏览器里检查内容、排版、封面和标签。
3. 发布前执行 `npm run publish`。
4. 检查通过后提交并推送到 `main`。
5. GitHub Actions 自动构建并部署到 GitHub Pages。

推荐命令顺序：

```bash
npm run dev
npm run publish
git status
git add .
git commit -m "docs: update blog guide"
git push origin main
```

本地 `.git/hooks/pre-commit` 里也有一个本地 Git hook：新增 `.md` 或 `.mdx` 文件时，如果 `pubDatetime:` 为空，会在提交前补当前时间；修改文章时，会更新 `modDatetime`。这个 hook 是本机 `.git/` 目录下的本地配置，不会随仓库提交到 GitHub。仓库里真正可复现的是 `scripts/fill-post-dates.mjs`，它会在 `dev`、`check`、`build` 前运行。

## 文章 Frontmatter

最小推荐写法：

```yaml
---
title: 文章标题
description: 文章摘要，会显示在首页和列表中
pubDatetime:
modDatetime: 2026-04-26T17:23:59+08:00
tags:
  - 博客
  - 使用说明
draft: false
---
```

常用字段：

- `title`：文章标题。
- `description`：文章摘要。
- `pubDatetime`：发布时间，可以先留空，运行检查、构建或提交时会自动补全。
- `modDatetime`：修改时间，可以留空；本地 hook 会在修改文章并提交时更新。
- `tags`：标签数组，支持多个标签。
- `draft`：是否为草稿；发布文章时设为 `false`。
- `image`：手动指定封面；不写时由图库自动分配。
- `featured: true` 或 `tags` 中包含 `精选`：进入首页“推荐阅读”。
- `pinTop`：可选数字，只影响首页推荐阅读的人工排序，数字越大越靠前。

## 特殊功能

### 多标签归档

一篇文章可以有多个标签：

```yaml
tags:
  - 网络空间安全
  - 课程笔记
  - 精选
```

归档页支持按标签筛选；文章卡片和详情页会展示全部标签。

### 首页、精选页和全部文章页

首页不再做分页，只作为主要入口页：

- `推荐阅读` 最多显示 3 篇精选文章。
- `最近更新` 最多显示 3 篇非精选文章。
- `最近更新` 不包含精选文章，避免首页重复展示同一篇内容。
- `推荐阅读` 下方链接到 `/featured/`。
- 首页底部链接到 `/posts/`。

把文章加入推荐阅读有两种方式：

```yaml
tags:
  - 精选
```

或：

```yaml
featured: true
```

首页推荐阅读保留人工推荐能力：先按 `pinTop` 倒序，再按发布时间倒序。`/featured/` 精选文章页显示所有精选文章，每页 6 篇，按发布时间倒序分页。`/posts/` 全部文章页显示所有文章，包括精选文章，每页 6 篇，按发布时间倒序分页。

### MDX

普通文章用 `.md` 即可；需要组件、提示块或交互展示时使用 `.mdx`。

```mdx
---
title: MDX 示例
description: 在文章中使用组件
pubDatetime:
tags:
  - MDX
draft: false
---

import MdxTip from "@/components/mdx/MdxTip.astro";

## 正文标题

<MdxTip title="提示">这里是一个 MDX 组件。</MdxTip>
```

MDX 专用组件建议放在 `src/components/mdx/`。

### 自动封面图库

图库目录：

```text
public/covers/gallery/
```

日常写文章可以不写 `image`。运行 `npm run check`、`npm run build` 或 `npm run dev` 前，脚本会扫描图库并把分配结果写入：

```text
src/data/cover-assignments.json
```

`src/data/cover-assignments.json` 会被提交到仓库，用来保证旧文章封面稳定。新增图库图片不会导致旧文章封面漂移。

如果某篇文章需要固定封面，直接在 frontmatter 写：

```yaml
image: /covers/gallery/special.webp
```

手动 `image` 优先级最高。

## 注意事项

- 评论功能已经从当前站点删除，不是简单隐藏；不要再新增评论服务配置。
- 友链页面已经删除；不要新增 friend/friends/link 页面作为默认功能。
- `newblogtemp/` 是本地参考模板目录，已加入 `.gitignore`，不参与构建和提交。
- `dist/`、`.astro/`、`public/pagefind/` 是生成物，不需要手动提交。
- 图片建议优先使用 `.webp`，单张尽量控制在几百 KB 以内。GitHub Pages 不会按图片请求计费，但大图会拖慢访问，也会占用 Pages 站点体积。
- 公共仓库 + 标准 GitHub-hosted runner + GitHub Pages 是当前 0 成本方案；如果改成私有仓库、使用付费 runner、购买域名或接入第三方服务，可能出现额外费用。
- GitHub Pages 适合静态博客，不适合收集敏感数据、处理支付或作为商业 SaaS 后端。

更完整的站内说明见文章《博客架构、发布流程与 MDX 上手手册》。
