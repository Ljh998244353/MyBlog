# Repository Guidelines

## 项目结构与模块组织
该仓库是一个基于 Astro +GitHub Page的0成本静态博客。改动应尽量小而明确，并围绕具体路由或页面展开。

- `src/pages/`：页面路由与生成型端点，例如 `rss.xml.ts`、`search-index.json.ts`
- `src/components/`：共享 Astro 组件；`src/components/mdx/` 放置 MDX 相关辅助组件
- `src/content/blog/`：博客正文，使用 `.md` 或 `.mdx`
- `src/config/` 与 `src/utils/`：站点配置、路径工具与文章处理逻辑
- `src/styles/`：全局样式
- `public/`：静态资源
- `scripts/publish.mjs`：推送到 `main` 前使用的发布前检查脚本

## 构建、测试与开发命令
请使用 Node `>=22.12.0`。

- `npm install`：安装依赖
- `npm run dev` 或 `npm start`：启动本地 Astro 开发服务器
- `npm run check`：执行 Astro 类型检查与内容校验
- `npm run build`：构建静态站点到 `dist/`
- `npm run preview`：本地预览生产构建结果
- `npm run publish`：执行发布前检查流程，即 `check` + `build`


## 测试指南
当前仓库没有独立的单元测试框架。最低验证基线如下：

1. 运行 `npm run check`
2. 运行 `npm run build`
3. 通过 `npm run dev` 或 `npm run preview` 手动检查受影响页面

如果修改了文章内容，请根据 `src/content.config.ts` 校验 frontmatter 字段：`title`、`description`、`pubDate`、`tags`、`draft`。

## 要求
当你有不确定的问题时,应该优先问我,而不是猜.
你应该优先修改文件而不是创建文件.
整个项目的页面和组件都不要使用卡片式设计，不要引入卡片边框、卡片阴影或卡片容器化表达。
