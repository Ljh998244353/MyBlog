---
title: 文章封面图库使用说明
description: 介绍当前博客的自动封面图库、顺序与随机分配模式、手动封面优先级和性能注意事项。
pubDatetime: 2026-04-26T15:45:40+08:00
modDatetime:
tags:
  - 博客
  - 使用说明
  - 封面
  - 精选
draft: false
---

当前博客支持文章封面展示。文章可以手动指定封面，也可以从统一图库里自动分配封面。

## 图库目录

自动封面图库目录是：

```text
public/covers/gallery/
```

以后只需要把图片放进这个目录即可。推荐图片格式：

- `.webp`
- `.avif`
- `.jpg`
- `.png`

推荐尺寸接近 `1200x630`，单张图片尽量控制在 `300KB` 左右。图片越大，访问时加载越慢；图片数量越多，仓库和 Pages 体积也会变大。

## 自动分配规则

每次运行下面任意命令前，博客都会同步封面分配：

```bash
npm run dev
npm run check
npm run build
```

同步逻辑会扫描所有文章和图库图片，然后把结果写入：

```text
src/data/cover-assignments.json
```

这个文件会保存每篇文章对应的封面路径。已经分配过的文章不会重复随机或重新洗牌，所以封面展示是稳定的。

## 顺序模式

默认使用顺序模式：

```json
{
  "mode": "sequence",
  "assignments": {}
}
```

顺序模式会按图库文件名排序后循环分配。例如：

```text
001.webp
002.webp
003.webp
```

新文章会依次得到这些图片。如果文章数量超过图片数量，会从第一张继续循环。

## 随机模式

如果希望新文章第一次分配时随机选择封面，可以把 `mode` 改成：

```json
{
  "mode": "random",
  "assignments": {}
}
```

随机只发生在第一次分配。结果写入 `assignments` 后，后续构建会继续使用已经保存的封面。

## 手动封面优先

如果某篇文章需要固定使用指定图片，可以在 frontmatter 里写 `image`：

```yaml
---
title: 文章标题
description: 文章摘要
pubDatetime: 2026-04-26T17:23:59+08:00
modDatetime:
image: /covers/gallery/special.webp
tags:
  - 博客
draft: false
---
```

手动 `image` 的优先级最高。只要文章里写了非空 `image`，自动图库不会覆盖它。

## 新增图片后的行为

新增图库图片后，旧文章的封面不会自动变化。这样可以避免文章封面在每次构建时漂移。

如果希望某篇文章重新分配封面，可以打开：

```text
src/data/cover-assignments.json
```

删除对应文章的那一行分配，再运行：

```bash
npm run check
```

系统会重新为它分配一张图库图片。

## 性能说明

这个方案只扫描文章文件、图库文件名和一个 JSON 映射文件，不会在构建时压缩或转换图片。因此文章变多后，额外构建开销很小。

图片放在 `public/covers/gallery/` 下，会作为静态资源直接发布到 GitHub Pages。GitHub Pages 没有真正的按文件增量构建，但封面分配本身是增量的：旧文章、旧封面和旧分配不会重复处理。

## 推荐工作流

日常写文章时，可以不写 `image`：

```yaml
---
title: 新文章
description: 新文章摘要
pubDatetime: 2026-04-26T17:23:59+08:00
modDatetime:
tags:
  - 博客
draft: false
---
```

然后运行：

```bash
npm run check
```

如果图库里有图片，系统会自动补发布时间并分配封面。确认无误后再提交即可。
