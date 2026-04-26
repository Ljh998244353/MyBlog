import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import rehypeMermaid from "rehype-mermaid";
import rehypeComponents from "rehype-components";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { BASE_PATH, SITE } from "./src/config";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import {
  AdmonitionComponent,
  parseDirectiveNode,
  QuoteComponent,
  remarkCombined,
} from "./src/plugins/markdown-specials.mjs";

const siteUrl = new URL(SITE.website);
type AdmonitionType = "note" | "tip" | "important" | "warning" | "caution";
const createAdmonitionComponent =
  (type: AdmonitionType) => (properties: unknown, children: unknown[]) =>
    AdmonitionComponent(properties, children, type);

// https://astro.build/config
export default defineConfig({
  site: siteUrl.origin,
  base: BASE_PATH || undefined,
  i18n: {
    locales: ["zh-cn"],
    defaultLocale: "zh-cn",
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    icon({
      include: {
        "fa6-brands": ["*"],
        "fa6-solid": ["*"],
        "simple-icons": ["*"],
        "vscode-icons": ["*"],
        "material-symbols": ["*"],
        fluent: ["*"],
      },
    }),
    svelte(),
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
  ],
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid", "math"],
    },
    remarkPlugins: [
      remarkMath,
      remarkReadingTime,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
      remarkDirective,
      parseDirectiveNode,
      remarkCombined,
    ],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypeMermaid,
        {
          strategy: "img-svg",
          colorScheme: "light",
          dark: true,
        },
      ],
      [
        rehypeComponents,
        {
          components: {
            quote: QuoteComponent,
            note: createAdmonitionComponent("note"),
            tip: createAdmonitionComponent("tip"),
            important: createAdmonitionComponent("important"),
            warning: createAdmonitionComponent("warning"),
            caution: createAdmonitionComponent("caution"),
          },
        },
      ],
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
