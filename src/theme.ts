export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'kronos-theme';

let currentTheme: Theme = readInitialTheme();
let listeners: Array<(theme: Theme) => void> = [];

function readInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme): void {
  currentTheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  listeners.forEach((cb) => cb(theme));
}

export function toggleTheme(): void {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

export function onThemeChange(cb: (theme: Theme) => void): void {
  listeners.push(cb);
}

export function initTheme(): void {
  applyTheme(currentTheme);
}
