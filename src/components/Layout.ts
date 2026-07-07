import type { PageData } from '../types.ts';
import { renderHeader } from './Header.ts';
import { renderSidebar, attachSidebarBehavior } from './Sidebar.ts';
import { renderPageContent } from './Content.ts';
import { renderTOC, attachTOCScrollSpy } from './TOC.ts';
import { renderSearchResults } from './SearchResults.ts';
import { attachCodeBlockHandlers } from './CodeBlock.ts';
import { buildSearchIndex, searchEntries } from '../search.ts';
import type { SearchEntry } from '../types.ts';
import { getPages } from '../data/pages.ts';
import { navigate, refresh } from '../router.ts';
import { toggleTheme } from '../theme.ts';
import { getLocale, setLocale } from '../locale.ts';

export function renderLayout(page: PageData, anchor: string | null): string {
  return `
    <div class="min-h-screen flex flex-col">
      ${renderHeader()}
      <div class="flex-1 flex">
        <aside
          id="sidebar"
          class="hidden lg:block w-60 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 fixed lg:sticky top-14 h-[calc(100vh-3.5rem)] left-0 z-20"
        >
          ${renderSidebar(page.route, anchor)}
        </aside>
        <div
          id="sidebar-backdrop"
          class="hidden fixed inset-0 bg-black/60 z-10 lg:hidden"
        ></div>

        <main class="flex-1 min-w-0 flex justify-center px-6 py-10">
          <article class="w-full max-w-4xl" id="page-content">
            ${renderPageContent(page)}
          </article>
        </main>

        <aside class="hidden xl:block w-40 shrink-0 py-10 pr-6">
          <div class="sticky top-24" id="toc-container">
            ${renderTOC(page.blocks)}
          </div>
        </aside>
      </div>
    </div>
  `;
}

export function attachLayoutBehavior(root: HTMLElement, anchor: string | null): void {
  const sidebar = root.querySelector<HTMLElement>('#sidebar');
  if (sidebar) attachSidebarBehavior(sidebar);

  const content = root.querySelector<HTMLElement>('#page-content');
  if (content) attachCodeBlockHandlers(content);

  const tocContainer = root.querySelector<HTMLElement>('#toc-container');
  if (tocContainer && content) attachTOCScrollSpy(tocContainer, content);

  const searchIndex = buildSearchIndex(getPages());

  attachMobileMenu(root);
  attachHeaderSearch(root, searchIndex);
  attachAnchorCopy(root);
  attachHeaderControls(root);

  if (anchor) {
    requestAnimationFrame(() => {
      const target = document.getElementById(anchor);
      target?.scrollIntoView({ block: 'start' });
    });
  } else {
    window.scrollTo({ top: 0 });
  }
}

function attachMobileMenu(root: HTMLElement): void {
  const menuBtn = root.querySelector<HTMLButtonElement>('#mobile-menu-btn');
  const sidebar = root.querySelector<HTMLElement>('#sidebar');
  const backdrop = root.querySelector<HTMLElement>('#sidebar-backdrop');

  const closeDrawer = () => {
    sidebar?.classList.add('hidden');
    sidebar?.classList.remove('!block', 'fixed', 'inset-y-0');
    backdrop?.classList.add('hidden');
  };

  const openDrawer = () => {
    sidebar?.classList.remove('hidden');
    sidebar?.classList.add('!block');
    backdrop?.classList.remove('hidden');
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = !sidebar?.classList.contains('hidden');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  backdrop?.addEventListener('click', closeDrawer);

  sidebar?.addEventListener('click', (event) => {
    const anchorEl = (event.target as HTMLElement).closest('a');
    if (anchorEl && window.innerWidth < 1024) closeDrawer();
  });
}

function attachHeaderSearch(root: HTMLElement, searchIndex: SearchEntry[]): void {
  const input = root.querySelector<HTMLInputElement>('#header-search');
  const results = root.querySelector<HTMLElement>('#header-search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const query = input.value;
    const matches = searchEntries(searchIndex, query);
    results.innerHTML = renderSearchResults(matches, query);
    results.classList.toggle('hidden', query.trim() === '');
  });

  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') results.classList.remove('hidden');
  });

  results.addEventListener('click', (event) => {
    const anchorEl = (event.target as HTMLElement).closest('a');
    if (!anchorEl) return;
    event.preventDefault();
    const href = anchorEl.getAttribute('href');
    if (href) navigate(href);
    input.value = '';
    results.classList.add('hidden');
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node)) return;
    if (!input.contains(event.target) && !results.contains(event.target)) {
      results.classList.add('hidden');
    }
  });
}

function attachAnchorCopy(root: HTMLElement): void {
  root.querySelectorAll<HTMLAnchorElement>('.anchor-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = link.getAttribute('href')?.slice(1);
      if (!id) return;
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigate(`${window.location.pathname}#${id}`);
      navigator.clipboard?.writeText(url);
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
  });
}

function attachHeaderControls(root: HTMLElement): void {
  const themeBtn = root.querySelector<HTMLButtonElement>('#theme-toggle-btn');
  themeBtn?.addEventListener('click', () => {
    toggleTheme();
    refresh();
  });

  const localeBtn = root.querySelector<HTMLButtonElement>('#locale-toggle-btn');
  localeBtn?.addEventListener('click', () => {
    setLocale(getLocale() === 'en' ? 'es' : 'en');
    refresh();
  });
}
