import { t } from '../locale.ts';

const KEYWORDS = new Set([
  'public', 'private', 'protected', 'class', 'interface', 'enum', 'extends', 'implements',
  'static', 'final', 'void', 'return', 'new', 'if', 'else', 'for', 'while', 'try', 'catch',
  'finally', 'throw', 'throws', 'import', 'package', 'this', 'super', 'null', 'true', 'false',
  'abstract', 'default', 'switch', 'case', 'break', 'continue', 'synchronized', 'volatile',
  'const', 'let', 'var', 'function', 'export', 'from', 'async', 'await', 'in', 'of',
]);

const TYPES = new Set([
  'String', 'int', 'long', 'double', 'float', 'boolean', 'UUID', 'Instant', 'Optional',
  'Map', 'Set', 'List', 'CompletableFuture', 'Injector', 'AbstractModule',
]);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightLine(line: string): string {
  const escaped = escapeHtml(line);
  const tokenPattern = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(@[A-Za-z_]+)|\b([A-Za-z_][A-Za-z0-9_]*)\b/g;

  return escaped.replace(tokenPattern, (match, comment, string, annotation, word) => {
    if (comment) return `<span class="text-zinc-500">${comment}</span>`;
    if (string) return `<span class="text-violet-700 dark:text-violet-300">${string}</span>`;
    if (annotation) return `<span class="text-violet-600 dark:text-violet-400">${annotation}</span>`;
    if (word) {
      if (KEYWORDS.has(word)) return `<span class="text-violet-600 dark:text-violet-400 font-medium">${word}</span>`;
      if (TYPES.has(word)) return `<span class="text-violet-700 dark:text-violet-300">${word}</span>`;
      return word;
    }
    return match;
  });
}

let blockCounter = 0;

export function renderCodeBlock(code: string, lang = 'java'): string {
  const id = `code-block-${blockCounter++}`;
  const lines = code.replace(/\n+$/, '').split('\n');
  const numberedLines = lines
    .map((line, index) => {
      const lineNumber = index + 1;
      return `<tr><td class="select-none pr-4 text-right text-zinc-400 dark:text-zinc-600 align-top w-10">${lineNumber}</td><td class="whitespace-pre text-zinc-800 dark:text-zinc-200">${highlightLine(line) || ' '}</td></tr>`;
    })
    .join('');

  return `
    <div class="relative group my-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-violet-700/5 dark:bg-violet-700/10 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60">
        <span class="text-xs uppercase tracking-wide text-zinc-500 font-mono">${lang}</span>
        <button
          type="button"
          class="copy-code-btn text-xs text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-mono"
          data-target="${id}"
          data-label-copy="${t('copy', 'copiar')}"
          data-label-copied="${t('copied', 'copiado')}"
          data-label-failed="${t('failed to copy', 'error al copiar')}"
        >${t('copy', 'copiar')}</button>
      </div>
      <div class="overflow-x-auto">
        <table id="${id}" class="font-mono text-[13px] leading-6 border-collapse" data-raw="${encodeURIComponent(code.replace(/\n+$/, ''))}">
          <tbody>${numberedLines}</tbody>
        </table>
      </div>
    </div>
  `;
}

export function attachCodeBlockHandlers(container: HTMLElement): void {
  const buttons = container.querySelectorAll<HTMLButtonElement>('.copy-code-btn');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      if (!targetId) return;
      const table = container.querySelector<HTMLTableElement>(`#${targetId}`);
      if (!table) return;
      const raw = decodeURIComponent(table.dataset.raw ?? '');
      const original = button.dataset.labelCopy ?? button.textContent;
      navigator.clipboard
        .writeText(raw)
        .then(() => {
          button.textContent = button.dataset.labelCopied ?? 'copied';
        })
        .catch(() => {
          button.textContent = button.dataset.labelFailed ?? 'failed to copy';
        })
        .finally(() => {
          setTimeout(() => {
            button.textContent = original ?? '';
          }, 1500);
        });
    });
  });
}
