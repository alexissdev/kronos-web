# kronos-web

Sitio de documentación estilo JavaDoc para el plugin de Minecraft **Kronos HCF**. Construido con Vite + TypeScript (vanilla) + TailwindCSS, sin frameworks ni librerías de UI externas.

![Banner](public/kronos-banner.png)

---

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Vite | 8 | Bundler y dev server |
| TypeScript | ~6 | Vanilla TS, `strict: true`, sin JSX |
| TailwindCSS | 3 | Estilos utilitarios con `darkMode: 'class'` |
| — | — | Sin librerías de UI ni de syntax highlighting externas |

No hay backend ni build step de contenido: todas las páginas son estructuras de datos TypeScript (`Block[]`) que se renderizan directamente a DOM.

## Características

- **Dark / Light mode** — toggle en el header, con persistencia en `localStorage` y detección inicial de `prefers-color-scheme`. Sin flash de tema incorrecto (script inline en `index.html` que aplica la clase antes del primer render).
- **i18n EN / ES** — toggle en el header, con persistencia en `localStorage` y detección inicial de `navigator.language`. Implementado con un helper `t(en, es)` (`src/locale.ts`), sin librerías externas. Cada página exporta una función `buildXPage()` que se reconstruye por idioma.
- **Layout de tres paneles** (estilo JavaDoc): sidebar de navegación fijo, contenido central, TOC "on this page" a la derecha con scroll-spy.
- **Sidebar** con árbol de navegación colapsable por módulo y filtro de búsqueda en tiempo real.
- **Búsqueda global** en el header con resultados inline (título + extracto) construidos desde un índice generado a partir de los encabezados de cada página.
- **Bloques de código** con numeración de líneas, resaltado de sintaxis (tonos violeta, sin dependencias) y botón de copiar al portapapeles.
- **Anchors copiables** — cada `h2`/`h3` muestra un ícono `#` al hacer hover que copia el enlace directo a esa sección.
- **Router propio** basado en History API (sin hash), con navegación interceptada en los `<a>` internos y scroll automático a anchors.
- **Responsive** — el sidebar colapsa a un drawer con overlay en mobile.
- **Sin backend** — todo el contenido está hardcodeado en `src/pages/`.

## Módulos documentados

Home (`/`) más doce módulos del plugin, cada uno como una página independiente con secciones ancladas (Overview, Domain Model, Services, Events, Commands, Guide, etc.):

| Módulo | Ruta |
|---|---|
| kronos-api | `/api` |
| kronos-common | `/common` |
| kronos-economy | `/economy` |
| kronos-players | `/players` |
| kronos-timers | `/timers` |
| kronos-factions | `/factions` |
| kronos-claims | `/claims` |
| kronos-koth | `/koth` |
| kronos-classes | `/classes` |
| kronos-spawn | `/spawn` |
| kronos-scoreboard | `/scoreboard` |
| kronos-plugin | `/plugin` |

## Estructura

```
public/
├── kronos-icon.png     # favicon + logo (header/sidebar)
└── kronos-banner.png   # banner de la home

src/
├── main.ts              # bootstrap: theme, locale, router
├── router.ts             # router con History API + refresh()
├── locale.ts              # estado de idioma (EN/ES) + helper t()
├── theme.ts                # estado de tema (dark/light)
├── search.ts                 # construye el índice de búsqueda
├── types.ts                    # tipos Block / PageData / NavModule
├── components/
│   ├── Layout.ts         # shell de tres paneles + wiring de eventos
│   ├── Header.ts          # barra superior: búsqueda, toggles, logo
│   ├── Sidebar.ts          # árbol de navegación + filtro
│   ├── Content.ts           # renderer de Block[] a HTML
│   ├── Table.ts               # tabla con zebra striping
│   ├── CodeBlock.ts            # bloque de código con copy + highlight
│   ├── TOC.ts                    # "on this page" con scroll-spy
│   └── SearchResults.ts           # dropdown de resultados de búsqueda
├── data/
│   └── pages.ts          # registro de rutas -> builders de página
└── pages/
    ├── util.ts            # helper ic() (chip de código inline)
    ├── home.ts
    └── {timers,factions,claims,koth,players,api,economy,
        classes,spawn,scoreboard,common,plugin}.ts
```

## Inicio rápido

```bash
npm install
npm run dev
```

El dev server arranca en `http://localhost:5173` (o el siguiente puerto libre).

```bash
npm run build      # type-check (tsc) + build de producción a dist/
npm run preview    # sirve el build de producción localmente
```

## Agregar contenido

**Nueva sección dentro de un módulo existente** → agregar un bloque (`h2`/`h3`/`p`/`table`/`code`/`ol`/`ul`/`chips`/`note`) al array `blocks` de la función `buildXPage()` correspondiente en `src/pages/`. Usar el helper `t(en, es)` para todo texto visible, y `ic('texto')` para chips de código inline.

**Nuevo módulo/página** → crear `src/pages/nuevo.ts` exportando `buildNuevoPage(): PageData`, registrarlo en `src/data/pages.ts` (`getPages()` y `moduleOrder`). El sidebar y el índice de búsqueda se generan automáticamente a partir de los bloques `h2` de esa página.

**Nuevo idioma** → no soportado sin refactor; el sistema actual asume exactamente EN/ES vía `t(en, es)`.

## Licencia

MIT — ver [LICENSE](LICENSE).

---

*Kronos HCF — Documentación no oficial del plugin, por AlexisDev.*
