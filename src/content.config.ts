import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
  }),
  schema: ({ image }) =>
    z
      .object({
        author: z.string().default(SITE.author),
        pubDatetime: z.date(),
        modDatetime: z.date().optional().nullable(),
        title: z.string(),
        featured: z.boolean().optional(),
        draft: z.boolean().optional(),
        tags: z.array(z.string()).default(["others"]),
        ogImage: image().or(z.string()).optional(),
        description: z.string(),
        canonicalURL: z.string().optional(),
        hideEditPost: z.boolean().optional(),
        timezone: z.string().optional(),
        pubDate: z.date().optional(),
        image: z.string().optional(),
        slugId: z.string().optional(),
        category: z.string().optional(),
        pinTop: z.number().optional(),
      })
      .transform(data => ({
        ...data,
        pubDate: data.pubDate ?? data.pubDatetime,
        image:
          data.image ?? (typeof data.ogImage === "string" ? data.ogImage : ""),
        slugId: data.slugId ?? "",
        category: data.category ?? data.tags[0] ?? "others",
        pinTop:
          data.pinTop ?? (data.featured || data.tags.includes("精选") ? 1 : 0),
      })),
});

const spec = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/spec" }),
});

export const collections = { blog, spec };
