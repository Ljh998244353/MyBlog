import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
import { withBase } from '../utils/paths';

export const GET: APIRoute = async (context) => {
  const origin = context.site ?? siteConfig.siteUrl;
  const sitemapUrl = new URL(withBase('/sitemap-index.xml'), origin).toString();

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
