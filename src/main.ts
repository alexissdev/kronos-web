import './styles/base.css';
import { initRouter, onRouteChange } from './router.ts';
import { renderLayout, attachLayoutBehavior } from './components/Layout.ts';
import { initTheme } from './theme.ts';
import { initLocale } from './locale.ts';

initTheme();
initLocale();

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

onRouteChange((page, anchor) => {
  app.innerHTML = renderLayout(page, anchor);
  attachLayoutBehavior(app, anchor);
});

initRouter();
