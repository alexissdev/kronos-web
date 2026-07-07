function renderCell(text: string): string {
  const inlineCodePattern = /`([^`]+)`/g;
  return text.replace(
    inlineCodePattern,
    (_match, code) =>
      `<code class="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-mono text-[12px]">${code}</code>`,
  );
}

export function renderTable(headers: string[], rows: string[][]): string {
  const headerHtml = headers
    .map(
      (header) =>
        `<th class="text-left px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800">${header}</th>`,
    )
    .join('');

  const rowsHtml = rows
    .map((row, rowIndex) => {
      const rowBg = rowIndex % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-900/40';
      const cells = row
        .map(
          (cell) =>
            `<td class="px-4 py-2 align-top text-zinc-700 dark:text-zinc-300 border-b border-zinc-200/60 dark:border-zinc-800/60">${renderCell(cell)}</td>`,
        )
        .join('');
      return `<tr class="${rowBg}">${cells}</tr>`;
    })
    .join('');

  return `
    <div class="my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-violet-100 dark:bg-violet-900/30">
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}
