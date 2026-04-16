import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserSite =
  Boolean(owner) &&
  Boolean(repo) &&
  repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

const site = process.env.SITE_URL || (owner ? `https://${owner}.github.io` : 'https://example.github.io');
const base =
  process.env.BASE_PATH ||
  (process.env.GITHUB_ACTIONS && repo && !isUserSite ? `/${repo}` : '');

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [mdx(), sitemap()],
  markdown: {
    syntaxHighlight: 'shiki',
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['heading-anchor'],
            ariaLabel: 'Link to this heading'
          }
        }
      ]
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      }
    }
  }
});
