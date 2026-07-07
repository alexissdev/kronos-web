import type { SearchEntry } from '../types.ts';
import { t } from '../locale.ts';

export function renderSearchResults(results: SearchEntry[], query: string): string {
  if (query.trim() === '') return '';

  if (results.length === 0) {
    return `
      <div class="p-4 text-sm text-zinc-500">${t('No results for', 'Sin resultados para')} "<span class="text-zinc-700 dark:text-zinc-300">${query}</span>"</div>
    `;
  }

  const items = results
    .map(
      (entry) => `
        <a
          href="/${entry.route}#${entry.anchor}"
          class="search-result-link block px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-b-0"
        >
          <div class="flex items-center gap-2 text-xs text-zinc-500 mb-0.5">
            <span class="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-mono">${entry.moduleLabel}</span>
          </div>
          <div class="text-sm text-zinc-900 dark:text-zinc-100 font-medium">${entry.heading}</div>
          ${entry.excerpt ? `<div class="text-xs text-zinc-500 truncate mt-0.5">${entry.excerpt}</div>` : ''}
        </a>
      `,
    )
    .join('');

  return `
    <div class="max-h-96 overflow-y-auto">${items}</div>
  `;
}
