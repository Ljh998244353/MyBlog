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

- 新文章放在 `src/data/blog/`
- frontmatter 至少包含 `title`、`description`、`pubDatetime`、`tags`、`draft`
- 如需按目录组织文章，路由会自动映射到 `/posts/...`

## 说明

当前仓库仍在持续收口 AstroPaper 迁移后的个性化配置与内容整理，站点会以小步迭代的方式继续完善。
