import type { Block, PageData } from '../types.ts';
import { renderCodeBlock } from './CodeBlock.ts';
import { renderTable } from './Table.ts';
import { t } from '../locale.ts';

function anchorIcon(id: string): string {
  return `
    <a href="#${id}" class="anchor-link ml-2 text-violet-500 hover:text-violet-400" aria-label="${t('Copy link to section', 'Copiar enlace a la sección')}">
      #
    </a>
  `;
}

function renderBlock(block: Block): string {
  switch (block.kind) {
    case 'banner':
      return `
        <img
          src="${block.src}"
          alt="${block.alt}"
          class="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8"
        />
      `;
    case 'hero':
      return `
        <p class="text-lg leading-8 text-zinc-700 dark:text-zinc-300 mb-8 max-w-3xl">
          ${block.text}
        </p>
      `;
    case 'h2':
      return `
        <h2 id="${block.id}" class="group scroll-mt-24 mt-12 mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b-2 border-violet-500 inline-block">
          ${block.text}${anchorIcon(block.id)}
        </h2>
      `;
    case 'h3':
      return `
        <h3 id="${block.id}" class="group scroll-mt-24 mt-8 mb-3 text-lg font-semibold text-violet-600 dark:text-violet-400">
          ${block.text}${anchorIcon(block.id)}
        </h3>
      `;
    case 'p':
      return `<p class="my-3 leading-7 text-zinc-700 dark:text-zinc-300">${block.html}</p>`;
    case 'table':
      return renderTable(block.headers, block.rows);
    case 'code':
      return renderCodeBlock(block.code, block.lang ?? 'java');
    case 'ol':
      return `<ol class="list-decimal list-inside my-3 space-y-2 text-zinc-700 dark:text-zinc-300 leading-7">${block.items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
    case 'ul':
      return `<ul class="list-disc list-inside my-3 space-y-2 text-zinc-700 dark:text-zinc-300 leading-7">${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
    case 'chips':
      return `<div class="flex flex-wrap gap-2 my-3">${block.items
        .map(
          (item) =>
            `<span class="px-2 py-1 rounded font-mono text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700">${item}</span>`,
        )
        .join('')}</div>`;
    case 'note':
      return `<div class="my-4 px-4 py-3 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-700/10 text-sm text-zinc-700 dark:text-zinc-300 leading-6"><span class="text-violet-600 dark:text-violet-400 font-semibold">${t('Note', 'Nota')} — </span>${block.html}</div>`;
    default:
      return '';
  }
}

export function renderBreadcrumb(page: PageData): string {
  const home = t('Home', 'Inicio');
  const crumbs = page.route === 'home' ? [home] : [home, page.module, page.title];
  return `
    <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-6" aria-label="${t('Breadcrumb', 'Ruta de navegación')}">
      ${crumbs
        .map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const separator = index > 0 ? '<span class="text-zinc-400 dark:text-zinc-700">/</span>' : '';
          const label = isLast
            ? `<span class="text-zinc-700 dark:text-zinc-300">${crumb}</span>`
            : `<span class="hover:text-violet-600 dark:hover:text-violet-400">${crumb}</span>`;
          return `${separator}${label}`;
        })
        .join('')}
    </nav>
  `;
}

export function renderPageContent(page: PageData): string {
  const breadcrumb = renderBreadcrumb(page);
  const title = `
    <h1 class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 pb-3 border-b-2 border-violet-500 inline-block mb-8">
      ${page.title}
    </h1>
  `;
  const body = page.blocks.map(renderBlock).join('\n');
  return `<div class="prose-section max-w-none">${breadcrumb}${title}${body}</div>`;
}
