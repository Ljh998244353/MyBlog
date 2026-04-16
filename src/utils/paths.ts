const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
}

export function stripBase(pathname: string) {
  if (!base) {
    return pathname || '/';
  }

  if (pathname.startsWith(base)) {
    return pathname.slice(base.length) || '/';
  }

  return pathname || '/';
}
