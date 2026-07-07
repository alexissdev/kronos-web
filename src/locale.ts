export type Locale = 'en' | 'es';

const STORAGE_KEY = 'kronos-locale';

let currentLocale: Locale = readInitialLocale();
let listeners: Array<(locale: Locale) => void> = [];

function readInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'es') return stored;
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  listeners.forEach((cb) => cb(locale));
}

export function onLocaleChange(cb: (locale: Locale) => void): void {
  listeners.push(cb);
}

export function t(en: string, es: string): string {
  return currentLocale === 'es' ? es : en;
}

export function initLocale(): void {
  document.documentElement.lang = currentLocale;
}
