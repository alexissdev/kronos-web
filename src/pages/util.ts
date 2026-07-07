export { t } from '../locale.ts';

export function ic(text: string): string {
  return `<code class="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-mono text-[12px]">${text}</code>`;
}
