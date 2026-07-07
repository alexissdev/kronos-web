import type { Block, PageData } from '../types.ts';
import { moduleOrder, getPages } from '../data/pages.ts';
import { t } from '../locale.ts';

function moduleSubPages(page: PageData): { id: string; text: string }[] {
  return page.blocks
    .filter((block): block is Extract<Block, { kind: 'h2' }> => block.kind === 'h2')
    .map((block) => ({ id: block.id, text: block.text }));
}

export function renderSidebar(currentRoute: string, currentAnchor: string | null): string {
  const pages = getPages();

  const modulesHtml = moduleOrder
    .map((route) => {
      const page = pages[route];
      const isActiveModule = currentRoute === route;
      const subPages = moduleSubPages(page);

      const subItemsHtml = subPages
        .map((sub) => {
          const isActiveSub = isActiveModule && currentAnchor === sub.id;
          return `
            <li data-nav-item data-nav-text="${sub.text.toLowerCase()}">
              <a
                href="/${route}#${sub.id}"
                class="nav-sub-link block pl-4 pr-2 py-1.5 text-sm border-l-2 ${
                  isActiveSub
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700'
                } transition-colors truncate"
              >${sub.text}</a>
            </li>
          `;
        })
        .join('');

      return `
        <li class="module-group" data-nav-item data-nav-text="${page.module.toLowerCase()}">
          <div
            class="module-toggle w-full flex items-center justify-between px-2 py-1.5 rounded text-sm font-mono ${
              isActiveModule ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400'
            }"
            data-module="${route}"
          >
            <a href="/${route}" class="flex-1 text-left truncate border-l-2 ${isActiveModule ? 'border-violet-500 pl-2' : 'border-transparent pl-2'}">${page.module}</a>
            <button type="button" class="module-chevron-btn px-1 text-zinc-400 dark:text-zinc-600 hover:text-violet-600 dark:hover:text-violet-400" aria-label="${t('Toggle module', 'Alternar módulo')}">
              <span class="module-chevron inline-block transition-transform ${isActiveModule ? 'rotate-90' : ''}">&rsaquo;</span>
            </button>
          </div>
          <ul class="module-pages ${isActiveModule ? '' : 'hidden'} space-y-0.5 mt-0.5">
            ${subItemsHtml}
          </ul>
        </li>
      `;
    })
    .join('');

  return `
    <div class="flex flex-col h-full">
      <div class="px-4 pt-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <a href="/" class="flex items-center gap-2">
          <span class="h-9 w-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-violet-700/40">
            <img src="/kronos-icon.png" alt="Kronos HCF" class="h-full w-full object-cover object-[50%_28%] scale-125" />
          </span>
          <span class="text-lg font-extrabold tracking-wide text-violet-600 dark:text-violet-400 uppercase leading-tight">Kronos HCF</span>
        </a>
        <span class="inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-mono bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700">v1.0.0-SNAPSHOT</span>
      </div>
      <div class="px-3 pt-3 pb-2">
        <input
          type="search"
          id="sidebar-search"
          placeholder="${t('Filter navigation...', 'Filtrar navegación...')}"
          class="w-full px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
        />
      </div>
      <nav class="flex-1 overflow-y-auto px-2 pb-6" id="sidebar-nav">
        <ul class="space-y-1">${modulesHtml}</ul>
      </nav>
    </div>
  `;
}

export function attachSidebarBehavior(container: HTMLElement): void {
  const searchInput = container.querySelector<HTMLInputElement>('#sidebar-search');
  const navItems = container.querySelectorAll<HTMLElement>('[data-nav-item]');

  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    navItems.forEach((item) => {
      if (!item.classList.contains('module-group')) return;
      const moduleMatches = (item.dataset.navText ?? '').includes(query);
      const subItems = Array.from(item.querySelectorAll<HTMLElement>('li[data-nav-item]'));
      let anySubMatches = false;
      subItems.forEach((sub) => {
        const matches = query === '' || (sub.dataset.navText ?? '').includes(query);
        sub.classList.toggle('hidden', !matches);
        if (matches) anySubMatches = true;
      });
      const shouldShowModule = query === '' || moduleMatches || anySubMatches;
      item.classList.toggle('hidden', !shouldShowModule);

      const pagesList = item.querySelector<HTMLElement>('.module-pages');
      if (query !== '' && anySubMatches) {
        pagesList?.classList.remove('hidden');
      }
    });
  });

  const toggleButtons = container.querySelectorAll<HTMLButtonElement>('.module-chevron-btn');
  toggleButtons.forEach((button) => {
    const chevron = button.querySelector<HTMLElement>('.module-chevron');
    const group = button.closest('.module-group');
    const pagesList = group?.querySelector<HTMLElement>('.module-pages');

    button.addEventListener('click', (event) => {
      event.preventDefault();
      pagesList?.classList.toggle('hidden');
      chevron?.classList.toggle('rotate-90');
    });
  });
}
