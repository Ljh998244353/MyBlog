import type { APIRoute } from 'astro';
import { getPublishedPosts, createExcerpt, getPostPath, stripMdx } from '../utils/posts';
import { withBase } from '../utils/paths';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const body = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    url: withBase(getPostPath(post)),
    excerpt: createExcerpt(post.body ?? post.data.description),
    content: stripMdx(post.body ?? ''),
    pubDate: post.data.pubDate.toISOString()
  }));

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
