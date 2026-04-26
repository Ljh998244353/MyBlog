import type { LicenseConfig, ProfileConfig, SiteConfig } from "./types/config";

const productionSiteUrl = new URL("https://ljh998244353.github.io/MyBlog/");

const normalizeBasePath = (value: string | undefined) => {
  if (!value || value === "/") {
    return "";
  }

  return value.startsWith("/")
    ? value.replace(/\/$/, "")
    : `/${value.replace(/\/$/, "")}`;
};

export const PRODUCTION_BASE_PATH = normalizeBasePath(
  productionSiteUrl.pathname
);

export const BASE_PATH = normalizeBasePath(
  process.env.SITE_BASE_PATH ?? PRODUCTION_BASE_PATH
);

export const SITE = {
  website: productionSiteUrl.href,
  author: "liu_jh",
  profile: "https://github.com/ljh998244353",
  desc: "liu_jh 的 Blog",
  title: "liu_jh の Blog",
  ogImage: "alice2.png",
  homeHeroImage: "alice2.png",
  lightAndDarkMode: true,
  postPerIndex: 3,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/ljh998244353/MyBlog/edit/main/",
  },
  dynamicOgImage: false,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;

export const siteConfig: SiteConfig = {
  title: SITE.title,
  subTitle: SITE.desc,
  favicon: "/favicon.svg",
  pageSize: SITE.postPerPage,
  toc: {
    enable: true,
    depth: 3,
  },
  blogNavi: {
    enable: true,
  },
  theme: {
    AOS: true,
  },
};

export const profileConfig: ProfileConfig = {
  avatar: "/alice2.png",
  name: SITE.author,
  description: SITE.desc,
  indexPage: SITE.profile,
  startYear: 2026,
};

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: "CC BY-NC-SA 4.0",
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
