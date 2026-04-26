import rss from "@astrojs/rss";
import { getBlogEntrySort } from "../utils/content-utils"
import { siteConfig, profileConfig } from '../config';
import type { APIContext } from "astro";
import { getPostUrl } from "@utils/url-utils";

export async function GET(context: APIContext) {
    const blog = await getBlogEntrySort("zh-cn");
    return rss({
        title: `${siteConfig.title} - ${siteConfig.subTitle}`,
        description: profileConfig.description,
        site: context.site ?? "https://ljh998244353.github.io",
        items: blog.slice(0, 20).map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: getPostUrl("zh-cn", post.routePath),
        })),
    })
}
