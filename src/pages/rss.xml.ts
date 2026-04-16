import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { siteConfig } from '../config/site';
import { getPostPath, getPublishedPosts } from '../utils/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? siteConfig.siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getPostPath(post)
    }))
  });
};
