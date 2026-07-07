import type { Block } from '../types.ts';
import { t } from '../locale.ts';

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

function collectEntries(blocks: Block[]): TocEntry[] {
  return blocks
    .filter((block): block is Extract<Block, { kind: 'h2' | 'h3' }> => block.kind === 'h2' || block.kind === 'h3')
    .map((block) => ({ id: block.id, text: block.text, level: block.kind === 'h2' ? 2 : 3 }));
}

export function renderTOC(blocks: Block[]): string {
  const entries = collectEntries(blocks);
  if (entries.length === 0) return '';

  const items = entries
    .map(
      (entry) => `
        <li>
          <a
            href="#${entry.id}"
            data-toc-link="${entry.id}"
            class="toc-link block truncate py-1 border-l-2 border-transparent pl-3 text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors ${entry.level === 3 ? 'ml-3 text-xs' : 'text-sm'}"
          >${entry.text}</a>
        </li>
      `,
    )
    .join('');

  return `
    <div>
      <p class="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-3">${t('On this page', 'En esta página')}</p>
      <ul>${items}</ul>
    </div>
  `;
}

let observer: IntersectionObserver | null = null;

const ACTIVE_CLASSES = ['border-violet-500', 'text-violet-600', 'dark:text-violet-400'];

export function attachTOCScrollSpy(tocContainer: HTMLElement, contentContainer: HTMLElement): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  const headings = Array.from(contentContainer.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
  if (headings.length === 0) return;

  const links = tocContainer.querySelectorAll<HTMLAnchorElement>('.toc-link');
  const setActive = (id: string) => {
    links.forEach((link) => {
      const isActive = link.dataset.tocLink === id;
      ACTIVE_CLASSES.forEach((cls) => link.classList.toggle(cls, isActive));
      link.classList.toggle('text-zinc-500', !isActive);
    });
  };

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
  );

  headings.forEach((heading) => observer?.observe(heading));
  setActive(headings[0].id);
}
