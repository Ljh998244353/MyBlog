# liu_jh の Blog

基于 [AstroPaper](https://github.com/satnaing/astro-paper) 改造的个人博客，主要用于整理课程笔记、学习记录和长期维护的技术内容。

## 站点基线

- 框架：Astro
- 主题基线：AstroPaper
- 样式：Tailwind CSS
- 内容来源：`src/data/blog/`
- 搜索：Pagefind
- 部署目标：GitHub Pages

## 本地开发

要求 Node `>=22.12.0`。

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:4321`。

## 常用命令

```bash
npm run check
npm run build
npm run preview
npm run publish
```

- `npm run check`：执行 Astro 类型检查与内容校验
- `npm run build`：构建静态站点并生成 Pagefind 搜索索引
- `npm run preview`：重新构建一份适合本地根路径访问的预览站点并启动预览服务
- `npm run publish`：发布前检查，等价于完整跑一遍校验和构建

说明：

- `npm run build` 仍然保留 GitHub Pages 的 `/MyBlog` 基础路径，用于生产部署
- `npm run preview` 会临时去掉这个基础路径，避免本地打开首页时落到 404

## 内容组织

```text
src/
  components/    共享组件
  data/blog/     博客文章与课程笔记
  layouts/       页面布局
  pages/         路由页面与生成型端点
  styles/        全局样式
  utils/         路径、文章、OG 图等工具
public/          静态资源
scripts/         发布前脚本
```

## 写作说明

新文章直接放在 `src/data/blog/` 下，支持按子目录分组，路由会自动映射到 `/posts/...`。

frontmatter 最少需要以下字段：

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

可选字段：`featured: true`（置顶到首页精选区）。

## 常碰到的目录

- `src/data/blog/`：所有文章和笔记
- `src/config.ts`：站点标题、描述、分页数量、编辑链接、基础 URL
- `src/pages/`：路由页面（首页、搜索、标签、归档、RSS、robots.txt）
- `src/components/`：公共组件（头部、底部、文章卡片、分页）
- `src/layouts/`：页面与文章布局
- `src/styles/`：全局样式与排版样式

## 发布流程

1. 本地执行 `npm run publish`（依次跑 `check` 和 `build`，通过后再推）
2. 推送到 `main`

推送后 GitHub Actions 自动触发：

- `.github/workflows/deploy.yml`：安装依赖 → `npm run build` → 上传 `dist/` → 部署到 GitHub Pages
- `.github/workflows/ci.yml`：代码规范与构建检查

## 说明

当前仓库仍在持续收口 AstroPaper 迁移后的个性化配置与内容整理，站点会以小步迭代的方式继续完善。优先做"小而确定"的增量修改，而不是大范围推倒重来。
