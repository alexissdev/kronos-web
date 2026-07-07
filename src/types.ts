export type Block =
  | { kind: 'banner'; src: string; alt: string }
  | { kind: 'hero'; text: string }
  | { kind: 'p'; html: string }
  | { kind: 'h2'; id: string; text: string }
  | { kind: 'h3'; id: string; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'code'; code: string; lang?: string }
  | { kind: 'ol'; items: string[] }
  | { kind: 'ul'; items: string[] }
  | { kind: 'chips'; items: string[] }
  | { kind: 'note'; html: string };

export interface PageData {
  route: string;
  module: string;
  title: string;
  blocks: Block[];
}

export interface NavPage {
  label: string;
  anchor: string;
}

export interface NavModule {
  id: string;
  label: string;
  pages: NavPage[];
}

export interface SearchEntry {
  route: string;
  anchor: string;
  moduleLabel: string;
  heading: string;
  excerpt: string;
}
