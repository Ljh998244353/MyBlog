import { BASE_PATH, SITE } from "@/config";

const siteUrl = new URL(SITE.website);

export const SITE_ORIGIN = siteUrl.origin;

export function withBase(path: string) {
  if (
    !path ||
    path.startsWith("#") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    /^[a-z]+:/i.test(path)
  ) {
    return path;
  }

  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized === "/") {
    return BASE_PATH ? `${BASE_PATH}/` : "/";
  }

  return `${BASE_PATH}${normalized}`;
}

export function stripBase(path: string) {
  if (!path) {
    return "/";
  }

  if (!BASE_PATH || !path.startsWith(BASE_PATH)) {
    return path;
  }

  const stripped = path.slice(BASE_PATH.length);
  return stripped || "/";
}
