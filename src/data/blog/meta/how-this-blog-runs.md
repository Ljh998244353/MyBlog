---
title: 这个博客现在怎么写、怎么构建、怎么发布
description: 给未来的自己留一份站点说明，覆盖内容目录、常用入口、本地校验和 GitHub Pages 发布流程。
pubDatetime: 2026-04-22T09:00:00+08:00
featured: true
tags:
  - 博客维护
  - AstroPaper
  - GitHub Pages
draft: false
---

这篇文章的目标很直接：给未来的自己留一份够用的站点说明。以后不管是继续写文章、改首页、换样式，还是排查部署问题，都先从这里找入口。

## 当前基线

这个博客现在基于 [AstroPaper](https://github.com/satnaing/astro-paper) 改造，目标不是做成一个通用模板，而是做成我自己的长期写作和整理工作区。

当前内容会主要围绕三类主题展开：

- 课程笔记
- 博客维护和配置记录
- 后续持续沉淀的技术文章

## 平时最常碰到的目录

如果只是正常写作和维护，下面这些位置最重要：

- `src/data/blog/`：文章正文。现在所有博客文章和笔记都放在这里。
- `src/pages/`：页面路由，例如首页、搜索页、标签页、归档页、RSS 和 `robots.txt`。
- `src/components/`：站点公共组件，例如头部、底部、文章卡片和分页。
- `src/layouts/`：页面和文章布局。
- `src/config.ts`：站点标题、描述、分页数量、编辑链接和基础 URL。
- `src/styles/`：全局样式和排版样式。

如果只想新增一篇文章，多数时候只需要修改 `src/data/blog/`。如果想改站点标题、简介、GitHub 编辑链接、分页数量或时区，则需要看 `src/config.ts`。

## 新文章怎么加

新文章直接放在 `src/data/blog/` 下，支持按目录继续分组。最少需要这些 frontmatter 字段：

```md
---
title: 标题
description: 摘要
pubDatetime: 2026-04-22T09:00:00+08:00
tags:
  - 示例标签
draft: false
---
```

如果文章放在子目录里，最终路由会自动带上目录层级。例如：

- `src/data/blog/meta/how-this-blog-runs.md`
- 对应路由 `/posts/meta/how-this-blog-runs/`

## 本地怎么检查

日常开发最常用的命令只有几条：

```bash
npm run dev
npm run check
npm run build
npm run preview
```

其中：

- `npm run dev` 用来本地预览页面
- `npm run check` 用来做 Astro 类型检查和内容校验
- `npm run build` 会执行完整构建，并生成 Pagefind 搜索索引
- `npm run preview` 用来本地预览生产构建结果

如果只是准备提交和发布，最直接的命令是：

```bash
npm run publish
```

这个脚本会按顺序执行 `npm run check` 和 `npm run build`，通过以后再推送到 `main`。

## 发布链路

当前部署目标是 GitHub Pages，发布流程拆成两层：

1. 本地执行 `npm run publish`
2. 推送到 `main`

推送后，GitHub Actions 会触发 `.github/workflows/deploy.yml`：

- 安装依赖
- 执行 `npm run build`
- 上传 `dist/`
- 部署到 GitHub Pages

另外，`.github/workflows/ci.yml` 会负责基础的代码规范和构建检查，避免明显问题混进主分支。

## 后续优先级

这个站点接下来最重要的事情，不是继续堆模板功能，而是稳定推进这几件事：

- 持续补课程笔记
- 继续把首页和信息架构做得更像自己的站
- 保证搜索、标签、RSS 和 GitHub Pages 发布链路一直可用

所以以后再回来看这个仓库，优先做“小而确定”的增量修改，而不是大范围推倒重来。
