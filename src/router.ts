import type { PageData } from './types.ts';
import { getPages, pageOrder } from './data/pages.ts';

export type RouteListener = (page: PageData, anchor: string | null) => void;

let listener: RouteListener | null = null;

function parseLocation(): { route: string; anchor: string | null } {
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const route = path === '' ? 'home' : path;
  const anchor = window.location.hash ? window.location.hash.slice(1) : null;
  return { route, anchor };
}

function resolvePage(route: string): PageData {
  const pages = getPages();
  return pages[route] ?? pages.home;
}

function dispatch(anchorOverride?: string | null): void {
  const { route, anchor } = parseLocation();
  const page = resolvePage(route);
  listener?.(page, anchorOverride !== undefined ? anchorOverride : anchor);
}

export function refresh(): void {
  dispatch();
}

export function navigate(path: string): void {
  const [routePart, anchorPart] = path.split('#');
  const normalized = routePart === '' || routePart === '/' ? '/' : `/${routePart.replace(/^\//, '')}`;
  const url = anchorPart ? `${normalized}#${anchorPart}` : normalized;
  window.history.pushState({}, '', url);
  dispatch(anchorPart ?? null);
}

export function onRouteChange(cb: RouteListener): void {
  listener = cb;
}

export function initRouter(): void {
  window.addEventListener('popstate', () => dispatch());

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const anchorEl = target.closest('a');
    if (!anchorEl) return;

    const href = anchorEl.getAttribute('href');
    if (!href) return;

    if (anchorEl.hasAttribute('data-external')) return;

    if (href.startsWith('/')) {
      event.preventDefault();
      navigate(href);
      return;
    }
  });

  dispatch();
}

export function getPageOrder(): string[] {
  return pageOrder;
}

export function getAllPages(): Record<string, PageData> {
  return getPages();
}
