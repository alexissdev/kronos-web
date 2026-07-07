import type { PageData, SearchEntry } from './types.ts';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

export function buildSearchIndex(pages: Record<string, PageData>): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const route of Object.keys(pages)) {
    const page = pages[route];
    let currentHeading = page.title;
    let currentAnchor = '';
    let excerpt = '';

    const flush = () => {
      if (currentAnchor) {
        entries.push({
          route,
          anchor: currentAnchor,
          moduleLabel: page.module,
          heading: currentHeading,
          excerpt,
        });
      }
    };

    for (const block of page.blocks) {
      if (block.kind === 'h2' || block.kind === 'h3') {
        flush();
        currentHeading = block.text;
        currentAnchor = block.id;
        excerpt = '';
      } else if (block.kind === 'p' && excerpt === '') {
        excerpt = stripHtml(block.html);
      }
    }
    flush();
  }

  return entries;
}

export function searchEntries(index: SearchEntry[], query: string): SearchEntry[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return [];

  return index
    .filter(
      (entry) =>
        entry.heading.toLowerCase().includes(normalized) ||
        entry.excerpt.toLowerCase().includes(normalized) ||
        entry.moduleLabel.toLowerCase().includes(normalized),
    )
    .slice(0, 20);
}
