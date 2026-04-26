import { getCollection, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { i18n } from "astro:config/client";
import { getPath } from "./getPath";
import coverData from "@/data/cover-assignments.json";

/**
 * 获取排序后的博客条目
 * @param filter 过滤函数，可选，默认过滤掉生产环境中的草稿文章
 * @param sort 排序函数，可选，默认按发布日期降序排列
 * @returns 排序后的博客条目数组
 */
// 1. 定义一个扩展类型，包含 fallback 状态
export type BlogEntryWithLocaleStatus = CollectionEntry<"blog"> & {
  isFallback?: boolean;
  routePath: string;
};

export function isFeaturedPost(entry: CollectionEntry<"blog">) {
  return entry.data.featured === true || entry.data.tags.includes("精选");
}

export function sortByPubDateDesc(
  a: CollectionEntry<"blog">,
  b: CollectionEntry<"blog">
) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

export function sortByPinnedThenPubDateDesc(
  a: CollectionEntry<"blog">,
  b: CollectionEntry<"blog">
) {
  const pinTopA = a.data.pinTop ?? 0;
  const pinTopB = b.data.pinTop ?? 0;

  if (pinTopA !== pinTopB) {
    return pinTopB - pinTopA;
  }

  return sortByPubDateDesc(a, b);
}

export async function getBlogEntrySort(
  _lang: string = "zh-cn",
  filter?: (entry: CollectionEntry<"blog">) => boolean | undefined,
  sort?: (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) => number
): Promise<BlogEntryWithLocaleStatus[]> {
  // 修改返回类型

  const defaultFilter = ({ data }: CollectionEntry<"blog">) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  };

  const blogEntries = await getCollection("blog", filter || defaultFilter);
  const selectedEntries = blogEntries.map(post => {
    const routePath = getPath(post.id, post.filePath, false);
    const assignmentKey = routePath.replace(/^\/+/, "");
    const assignedCover =
      coverData.assignments[
        assignmentKey as keyof typeof coverData.assignments
      ];

    return {
      ...post,
      data: {
        ...post.data,
        image: post.data.image || assignedCover || "",
      },
      isFallback: false,
      routePath,
    };
  });

  return selectedEntries.sort(sort || sortByPubDateDesc);
}

export async function getSpec(lang: string, spec: string) {
  const defaultLanguage = i18n?.defaultLocale ?? "zh-cn";
  let collection = await getEntry("spec", `${spec}/${lang}`);
  if (!collection)
    collection = await getEntry("spec", `${spec}/${defaultLanguage}`);
  return collection;
}
