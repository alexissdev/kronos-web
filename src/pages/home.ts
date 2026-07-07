import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildHomePage(): PageData {
  return {
    route: 'home',
    module: t('Home', 'Inicio'),
    title: t('Kronos HCF — Developer Documentation', 'Kronos HCF — Documentación para Desarrolladores'),
    blocks: [
      {
        kind: 'banner',
        src: '/kronos-banner.png',
        alt: 'Kronos HCF',
      },
      {
        kind: 'hero',
        text: t(
          'A production-ready Hardcore Factions plugin for Spigot 1.13.2 — DDD architecture, full async I/O.',
          'Un plugin de Hardcore Factions listo para producción para Spigot 1.13.2 — arquitectura DDD, E/S totalmente asíncrona.',
        ),
      },
      { kind: 'h2', id: 'tech-stack', text: t('Tech Stack', 'Stack Tecnológico') },
      {
        kind: 'table',
        headers: [t('Concern', 'Aspecto'), t('Technology', 'Tecnología')],
        rows: [
          [t('Minecraft server', 'Servidor de Minecraft'), '`Spigot 1.13.2`'],
          [t('Dependency injection', 'Inyección de dependencias'), '`Google Guice 5`'],
          [t('Primary persistence', 'Persistencia principal'), '`MongoDB` (MongoDB Java Driver)'],
          [t('Timer/deathban cache', 'Caché de timers/deathban'), '`Redis` (cliente async Lettuce)'],
          [t('Economy bridge', 'Puente de economía'), '`Vault`'],
          [t('Event bus', 'Bus de eventos'), '`Guava EventBus`'],
          [t('Build system', 'Sistema de build'), '`Gradle 8` + Shadow plugin 8.3.5'],
          [t('Java target', 'Versión de Java'), '`Java 11`'],
        ],
      },

      { kind: 'h2', id: 'module-overview', text: t('Module Overview', 'Resumen de Módulos') },
      {
        kind: 'p',
        html: t(
          `Kronos is split into twelve Gradle modules following a domain-driven design. Eleven are plain libraries; ${ic('kronos-plugin')} is the only module that produces the final shaded plugin jar.`,
          `Kronos está dividido en doce módulos de Gradle siguiendo un diseño orientado al dominio (DDD). Once son bibliotecas simples; ${ic('kronos-plugin')} es el único módulo que produce el jar final del plugin.`,
        ),
      },
      {
        kind: 'table',
        headers: [t('Module', 'Módulo'), t('Artifact', 'Artefacto'), t('Description', 'Descripción')],
        rows: [
          ['`kronos-common`', t('library', 'biblioteca'), t('Shared utilities: command framework, DB factories, SOTW/EOTW service, config helpers, exception hierarchy', 'Utilidades compartidas: framework de comandos, factorías de BD, servicio SOTW/EOTW, ayudantes de configuración, jerarquía de excepciones')],
          ['`kronos-api`', t('library', 'biblioteca'), t('Public read-only API exposed to external plugins via Bukkit ServicesManager', 'API pública de solo lectura expuesta a plugins externos vía Bukkit ServicesManager')],
          ['`kronos-economy`', t('library', 'biblioteca'), t('Vault economy wrapper with async CompletableFuture API', 'Envoltorio de economía Vault con API async basada en CompletableFuture')],
          ['`kronos-players`', t('library', 'biblioteca'), t('HCF player profiles, deathban (Redis-backed), crate locations', 'Perfiles de jugador HCF, deathban (respaldado por Redis), ubicaciones de crates')],
          ['`kronos-timers`', t('library', 'biblioteca'), t('Per-player timers (combat tag, PvP, enderpearl, etc.) stored in Redis with TTL', 'Timers por jugador (combat tag, PvP, enderpearl, etc.) almacenados en Redis con TTL')],
          ['`kronos-factions`', t('library', 'biblioteca'), t('Faction domain: members, roles, DTK, ally/enemy relations, faction bank', 'Dominio de facciones: miembros, roles, DTK, relaciones de aliados/enemigos, banco de facción')],
          ['`kronos-claims`', t('library', 'biblioteca'), t('Chunk-based territory system with SafeZone, WarZone, KOTH, and Faction claim types', 'Sistema de territorio basado en chunks con tipos de reclamo SafeZone, WarZone, KOTH y Facción')],
          ['`kronos-koth`', t('library', 'biblioteca'), t('King of the Hill event zones, creation sessions, capture lifecycle', 'Zonas de eventos King of the Hill, sesiones de creación, ciclo de vida de captura')],
          ['`kronos-classes`', t('library', 'biblioteca'), t('HCF combat classes (Archer, Bard, Rogue, Miner, Knight, Diamond)', 'Clases de combate HCF (Archer, Bard, Rogue, Miner, Knight, Diamond)')],
          ['`kronos-spawn`', t('library', 'biblioteca'), t('Protected spawn zone with wand-based setup', 'Zona de spawn protegida con configuración mediante varita')],
          ['`kronos-scoreboard`', t('library', 'biblioteca'), t('Sidebar scoreboard with 1-second timer updates and 5-second async stat refresh', 'Scoreboard lateral con actualizaciones de timers cada 1 segundo y refresco async de estadísticas cada 5 segundos')],
          ['`kronos-plugin`', t('plugin jar', 'jar del plugin'), t('Bootstrap: Guice wiring, command and listener registration, API exposure', 'Bootstrap: conexión de Guice, registro de comandos y listeners, exposición de la API')],
        ],
      },

      { kind: 'h2', id: 'dependency-graph', text: t('Module Dependency Graph', 'Grafo de Dependencias de Módulos') },
      {
        kind: 'p',
        html: t(
          `The graph below shows compile-time module dependencies rooted at ${ic('kronos-plugin')}.`,
          `El siguiente grafo muestra las dependencias de módulos en tiempo de compilación, con raíz en ${ic('kronos-plugin')}.`,
        ),
      },
      {
        kind: 'code',
        lang: 'text',
        code: `kronos-plugin
  ├── kronos-api
  │     └── (all domain modules)
  ├── kronos-scoreboard
  │     ├── kronos-timers
  │     ├── kronos-factions
  │     ├── kronos-economy
  │     └── kronos-koth
  ├── kronos-factions
  │     ├── kronos-players
  │     ├── kronos-economy
  │     └── kronos-common
  ├── kronos-claims
  │     └── kronos-factions
  ├── kronos-koth
  │     └── kronos-common
  ├── kronos-players
  │     └── kronos-common
  ├── kronos-timers
  │     └── kronos-common
  ├── kronos-spawn
  │     └── kronos-common
  ├── kronos-classes
  │     └── kronos-players
  └── kronos-economy
        └── kronos-common`,
      },

      { kind: 'h2', id: 'event-flow', text: t('Event Flow (Guava EventBus)', 'Flujo de Eventos (Guava EventBus)') },
      {
        kind: 'p',
        html: t(
          `All cross-module communication uses domain events posted on a shared ${ic('EventBus')} singleton bound by ${ic('RootModule')}. This keeps modules decoupled — a module never needs a direct reference to the services of another module in order to react to what happens there.`,
          `Toda la comunicación entre módulos usa eventos de dominio publicados en un ${ic('EventBus')} singleton vinculado por ${ic('RootModule')}. Esto mantiene los módulos desacoplados — un módulo nunca necesita una referencia directa a los servicios de otro módulo para reaccionar a lo que ocurre allí.`,
        ),
      },
      {
        kind: 'ol',
        items: [
          t(
            'A service layer completes a business operation (e.g. a faction member dies).',
            'Una capa de servicio completa una operación de negocio (p. ej. muere un miembro de una facción).',
          ),
          t(
            `The service posts a domain event (e.g. ${ic('FactionDtkDecrementedDomainEvent')}).`,
            `El servicio publica un evento de dominio (p. ej. ${ic('FactionDtkDecrementedDomainEvent')}).`,
          ),
          t(
            `Any ${ic('@Subscribe')}-annotated listener in any module receives the event synchronously.`,
            `Cualquier listener anotado con ${ic('@Subscribe')} en cualquier módulo recibe el evento de forma síncrona.`,
          ),
          t(
            'Listeners react without coupling directly to the originating service.',
            'Los listeners reaccionan sin acoplarse directamente al servicio de origen.',
          ),
        ],
      },
      {
        kind: 'table',
        headers: [t('Domain Event', 'Evento de Dominio'), t('Origin Module', 'Módulo de Origen'), t('Consumed By', 'Consumido Por')],
        rows: [
          ['`PlayerTimerStartedDomainEvent`', 'kronos-timers', 'ScoreboardManager, TimerListener'],
          ['`PlayerTimerExpiredDomainEvent`', 'kronos-timers', 'ScoreboardManager, TimerListener'],
          ['`FactionCreatedDomainEvent`', 'kronos-factions', t('Logging, tab-list', 'Logging, tab-list')],
          ['`FactionRaidableDomainEvent`', 'kronos-factions', t('PvpListener, announcements', 'PvpListener, anuncios')],
          ['`FactionDtkDecrementedDomainEvent`', 'kronos-factions', 'ScoreboardManager'],
          ['`FactionClaimedDomainEvent`', 'kronos-claims', t('ClaimListener cache invalidation', 'Invalidación de caché en ClaimListener')],
          ['`KothStartedDomainEvent`', 'kronos-koth', 'ScoreboardManager'],
          ['`KothCapturedDomainEvent`', 'kronos-koth', t('ScoreboardManager, crate delivery', 'ScoreboardManager, entrega de crate')],
        ],
      },

      { kind: 'h2', id: 'async-pattern', text: t('Async I/O Pattern', 'Patrón de E/S Asíncrona') },
      {
        kind: 'ul',
        items: [
          t(
            `All I/O operations return ${ic('CompletableFuture&lt;T&gt;')}.`,
            `Todas las operaciones de E/S devuelven ${ic('CompletableFuture&lt;T&gt;')}.`,
          ),
          t("MongoDB operations run on the MongoDB driver's thread pool.", 'Las operaciones de MongoDB se ejecutan en el thread pool del driver de MongoDB.'),
          t("Redis operations run on Lettuce's Netty event loop.", 'Las operaciones de Redis se ejecutan en el event loop de Netty de Lettuce.'),
          t(
            `Vault operations MUST run on the main thread — ${ic('VaultEconomyService')} uses a ${ic('mainThreadExecutor')}.`,
            `Las operaciones de Vault DEBEN ejecutarse en el hilo principal — ${ic('VaultEconomyService')} usa un ${ic('mainThreadExecutor')}.`,
          ),
          t(
            `Results are applied back to domain objects in ${ic('.thenAccept')} / ${ic('.thenCompose')} callbacks.`,
            `Los resultados se aplican de vuelta a los objetos de dominio en callbacks ${ic('.thenAccept')} / ${ic('.thenCompose')}.`,
          ),
        ],
      },

      { kind: 'h2', id: 'build-instructions', text: t('Build Instructions', 'Instrucciones de Build') },
      {
        kind: 'code',
        lang: 'bash',
        code: `./gradlew :kronos-plugin:shadowJar
# Output: kronos-plugin/build/libs/`,
      },

      { kind: 'h2', id: 'prerequisites', text: t('Prerequisites', 'Requisitos Previos') },
      {
        kind: 'ul',
        items: [
          t('Java 11 or newer', 'Java 11 o superior'),
          t(
            `MongoDB instance (default: ${ic('mongodb://localhost:27017')})`,
            `Instancia de MongoDB (por defecto: ${ic('mongodb://localhost:27017')})`,
          ),
          t(
            `Redis instance (default: ${ic('localhost:6379')})`,
            `Instancia de Redis (por defecto: ${ic('localhost:6379')})`,
          ),
          t(
            'Spigot 1.13.2 server with Vault and a compatible economy plugin',
            'Servidor Spigot 1.13.2 con Vault y un plugin de economía compatible',
          ),
        ],
      },
    ],
  };
}
