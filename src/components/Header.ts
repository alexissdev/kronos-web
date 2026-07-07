import { getLocale, t } from '../locale.ts';
import { getTheme } from '../theme.ts';

export function renderHeader(): string {
  const isDark = getTheme() === 'dark';
  const locale = getLocale();

  return `
    <header class="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur">
      <div class="flex items-center gap-3 lg:w-60 shrink-0">
        <button
          type="button"
          id="mobile-menu-btn"
          class="lg:hidden p-1.5 -ml-1.5 rounded text-zinc-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400"
          aria-label="${t('Toggle navigation menu', 'Alternar menú de navegación')}"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round" />
          </svg>
        </button>
        <a href="/" class="flex items-center gap-2 min-w-0">
          <span class="h-7 w-7 rounded-md overflow-hidden shrink-0 ring-1 ring-violet-700/40">
            <img src="/kronos-icon.png" alt="Kronos HCF" class="h-full w-full object-cover object-[50%_28%] scale-125" />
          </span>
          <span class="font-extrabold uppercase tracking-wide text-violet-600 dark:text-violet-400 text-sm truncate">Kronos HCF</span>
        </a>
      </div>

      <div class="flex-1 max-w-xl mx-auto relative">
        <input
          type="search"
          id="header-search"
          placeholder="${t('Search documentation...', 'Buscar en la documentación...')}"
          class="w-full px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
        />
        <div
          id="header-search-results"
          class="hidden absolute left-0 right-0 mt-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-40"
        ></div>
      </div>

      <div class="flex items-center gap-3 shrink-0 text-sm">
        <button
          type="button"
          id="locale-toggle-btn"
          aria-label="${t('Switch language', 'Cambiar idioma')}"
          class="flex items-center rounded-md border border-zinc-300 dark:border-zinc-800 overflow-hidden font-mono text-xs"
        >
          <span class="px-2 py-1 ${locale === 'en' ? 'bg-violet-600 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400'}">EN</span>
          <span class="px-2 py-1 ${locale === 'es' ? 'bg-violet-600 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400'}">ES</span>
        </button>
        <button
          type="button"
          id="theme-toggle-btn"
          aria-label="${t('Toggle color theme', 'Alternar tema de color')}"
          class="p-1.5 rounded-md border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400"
        >
          ${
            isDark
              ? `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 13a5 5 0 100-10 5 5 0 000 10zm8-5a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm11.657 6.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM6.464 5.05a1 1 0 01-1.414 0l-.707-.707A1 1 0 015.757 2.93l.707.707a1 1 0 010 1.414zm9.9-2.121a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM5.757 17.07a1 1 0 010-1.414l.707-.707A1 1 0 117.88 16.364l-.708.707a1 1 0 01-1.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z"/></svg>`
              : `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`
          }
        </button>
        <a href="https://github.com" target="_blank" rel="noreferrer" data-external class="hidden sm:inline text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400">GitHub</a>
        <a href="https://www.spigotmc.org" target="_blank" rel="noreferrer" data-external class="hidden sm:inline text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400">${t('View on Spigot', 'Ver en Spigot')}</a>
      </div>
    </header>
  `;
}
