import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildKothPage(): PageData {
  return {
    route: 'koth',
    module: 'kronos-koth',
    title: 'kronos-koth',
    blocks: [
      { kind: 'h2', id: 'concept', text: t('Concept', 'Concepto') },
      {
        kind: 'p',
        html: t(
          `Every King of the Hill event is built from two nested cuboid regions. The outer region protects
          the event area like a system claim; the inner region is where factions physically fight for control.`,
          `Todo evento King of the Hill se construye a partir de dos regiones cuboides anidadas. La región exterior protege
          el área del evento como un claim de sistema; la región interior es donde las facciones luchan físicamente por el control.`,
        ),
      },
      {
        kind: 'table',
        headers: [t('Region', 'Región'), t('Purpose', 'Propósito'), t('Size', 'Tamaño'), 'PvP'],
        rows: [
          [t('Claim zone', 'Zona de claim'), t('Prevents building and outside claims from overlapping the event', 'Impide construcciones y claims externos que se superpongan al evento'), t('Large — encloses the whole arena', 'Grande — encierra toda la arena'), t('Always enabled', 'Siempre habilitado')],
          [t('Capture zone', 'Zona de captura'), t('Must be continuously occupied by one faction to charge capture progress', 'Debe ser ocupada continuamente por una facción para acumular progreso de captura'), t('Small — usually the hill or center platform', 'Pequeña — usualmente la colina o plataforma central'), t('Always enabled', 'Siempre habilitado')],
        ],
      },

      { kind: 'h2', id: 'domain-model', text: t('Domain Model — KothZone', 'Modelo de Dominio — KothZone') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.koth.domain.KothZone'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`id`', '`String`', t('Immutable UUID-as-string assigned at creation', 'UUID inmutable como string, asignado en la creación')],
          ['`name`', '`String`', t('Unique display name used in commands', 'Nombre visible único usado en los comandos')],
          ['`world`', '`String`', t('World the zone exists in', 'Mundo en el que existe la zona')],
          ['`claimRegion`', '`Cuboid`', t('Outer bounds; protected like a system claim while the zone is registered', 'Límites exteriores; protegidos como un claim de sistema mientras la zona esté registrada')],
          ['`captureRegion`', '`Cuboid`', t('Inner bounds a faction must occupy alone to progress capture', 'Límites interiores que una facción debe ocupar en solitario para avanzar la captura')],
          ['`state`', '`KothState`', t('INACTIVE, ACTIVE, CAPTURING, or CAPTURED', 'INACTIVE, ACTIVE, CAPTURING o CAPTURED')],
          ['`captureTimeSeconds`', '`int`', t('Total seconds of uncontested occupation required to capture', 'Segundos totales de ocupación sin disputa requeridos para capturar')],
          ['`captureProgressSeconds`', '`int`', t('Seconds accumulated by the currently capturing faction', 'Segundos acumulados por la facción que está capturando actualmente')],
          ['`currentCapturingFactionId`', '`Optional<String>`', t('Faction currently charging capture progress, if any', 'Facción que actualmente acumula progreso de captura, si la hay')],
          ['`rewardCrateType`', '`CrateType`', t('Crate granted to the capturing faction on success', 'Crate otorgado a la facción capturadora al tener éxito')],
          ['`cooldownMinutes`', '`int`', t('Minutes before the zone can be started again after a capture', 'Minutos antes de que la zona pueda iniciarse de nuevo tras una captura')],
          ['`lastCapturedAt`', '`Optional<Instant>`', t('UTC instant of the most recent successful capture', 'Instante UTC de la captura exitosa más reciente')],
        ],
      },
      { kind: 'h3', id: 'kothzone-methods', text: t('Key Methods', 'Métodos Clave') },
      {
        kind: 'code',
        lang: 'java',
        code: `boolean isPlayerInClaimRegion(Location location)
boolean isPlayerInCaptureRegion(Location location)
void    resetProgress()          // clears captureProgressSeconds and currentCapturingFactionId
boolean isFullyCaptured()        // captureProgressSeconds >= captureTimeSeconds`,
      },

      { kind: 'h2', id: 'zone-creation-flow', text: t('Zone Creation Flow', 'Flujo de Creación de Zona') },
      {
        kind: 'p',
        html: t(
          `A ${ic('KothCreationSession')} walks an admin through defining both cuboids with the KOTH wand
          before the zone is persisted. The session is purely in-memory and keyed by the admin's UUID.`,
          `Una ${ic('KothCreationSession')} guía a un admin a través de la definición de ambos cuboides con la varita de KOTH
          antes de persistir la zona. La sesión es puramente en memoria e indexada por el UUID del admin.`,
        ),
      },
      {
        kind: 'code',
        lang: 'text',
        code: `AWAITING_CLAIM_POS1
      │  (left-click with wand)
      ▼
AWAITING_CLAIM_POS2
      │  (right-click with wand)
      ▼
AWAITING_CAPTURE_POS1
      │  (left-click with wand)
      ▼
AWAITING_CAPTURE_POS2
      │  (right-click with wand)
      ▼
AWAITING_NAME
      │  (/koth create <name>)
      ▼
READY ──────────► KothZone persisted, session discarded`,
      },

      { kind: 'h2', id: 'koth-lifecycle', text: t('KOTH Lifecycle', 'Ciclo de Vida de un KOTH') },
      {
        kind: 'code',
        lang: 'text',
        code: `/koth wand, define regions, /koth create hilltop
  │
  ▼
KothZone { state = INACTIVE } persisted
  │
  │  /koth start hilltop
  ▼
KothZone { state = ACTIVE }
  ├─ EventBus.post(KothStartedDomainEvent)
  └─ ScoreboardManager shows the active KOTH
  │
  │  a single faction occupies the capture region
  ▼
KothZone { state = CAPTURING, currentCapturingFactionId = X }
  │
  │  every second, KothTickTask:
  │    ├─ if X still alone in capture region → captureProgressSeconds++
  │    ├─ EventBus.post(KothCaptureProgressDomainEvent)
  │    └─ if a second faction enters          → resetProgress(), state = ACTIVE
  ▼
captureProgressSeconds >= captureTimeSeconds
  │
  ▼
KothZone { state = CAPTURED }
  ├─ EventBus.post(KothCapturedDomainEvent(zoneId, factionId))
  ├─ CrateService delivers rewardCrateType to the capturing faction
  └─ KothZone { state = INACTIVE } after cooldownMinutes elapses`,
      },

      { kind: 'h2', id: 'domain-events', text: t('Domain Events', 'Eventos de Dominio') },
      {
        kind: 'table',
        headers: [t('Event', 'Evento'), t('Trigger', 'Disparador'), t('Consumed By', 'Consumido Por')],
        rows: [
          ['`KothCreatedDomainEvent`', t('`KothCreationSession` reaches READY', '`KothCreationSession` llega a READY'), 'Logging'],
          ['`KothStartedDomainEvent`', t('`startZone(name)` is called', 'Se llama a `startZone(name)`'), 'ScoreboardManager'],
          ['`KothCaptureProgressDomainEvent`', t('Every second a faction occupies the capture region uncontested', 'Cada segundo que una facción ocupa la zona de captura sin disputa'), 'ScoreboardManager'],
          ['`KothCapturedDomainEvent`', t('captureProgressSeconds reaches captureTimeSeconds', 'captureProgressSeconds llega a captureTimeSeconds'), t('ScoreboardManager, crate delivery', 'ScoreboardManager, entrega de crate')],
          ['`KothResetDomainEvent`', t('A second faction interrupts an in-progress capture', 'Una segunda facción interrumpe una captura en curso'), t('ScoreboardManager, announcements', 'ScoreboardManager, anuncios')],
          ['`KothDeactivatedDomainEvent`', t('`deactivateZone(name)` or `deactivateAll()` is called', 'Se llama a `deactivateZone(name)` o `deactivateAll()`'), 'ScoreboardManager'],
        ],
      },

      { kind: 'h2', id: 'services', text: t('KothService Interface', 'Interfaz KothService') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`createZone(name, claimRegion, captureRegion)`', t('Persists a new KothZone in the INACTIVE state', 'Persiste una nueva KothZone en estado INACTIVE')],
          ['`startZone(name)`', t('Transitions a zone to ACTIVE and begins the per-second tick task', 'Transiciona una zona a ACTIVE e inicia la tarea de tick por segundo')],
          ['`deactivateZone(name)`', t('Stops the tick task and resets the zone to INACTIVE', 'Detiene la tarea de tick y restablece la zona a INACTIVE')],
          ['`deactivateAll()`', t('Deactivates every active zone; called from `PluginDisableHandler`', 'Desactiva todas las zonas activas; se llama desde `PluginDisableHandler`')],
          ['`tickCaptureProgress(name)`', t('Advances or resets capture progress for one zone; called once per second', 'Avanza o reinicia el progreso de captura de una zona; se llama una vez por segundo')],
          ['`resetProgress(name)`', t('Manually clears capture progress without deactivating the zone', 'Limpia manualmente el progreso de captura sin desactivar la zona')],
          ['`getZone(name)`', t('Returns the KothZone by name', 'Devuelve la KothZone por nombre')],
          ['`getActiveZones()`', t('Returns every zone currently in ACTIVE or CAPTURING state', 'Devuelve todas las zonas actualmente en estado ACTIVE o CAPTURING')],
        ],
      },

      { kind: 'h2', id: 'commands', text: t('Command Set', 'Conjunto de Comandos') },
      {
        kind: 'table',
        headers: [t('Command', 'Comando'), t('Permission', 'Permiso'), t('Description', 'Descripción')],
        rows: [
          ['`/koth wand`', '`kronos.koth.admin`', t('Gives the admin the region-selection wand', 'Entrega al admin la varita de selección de región')],
          ['`/koth create <name>`', '`kronos.koth.admin`', t('Finalizes an in-progress creation session under the given name', 'Finaliza una sesión de creación en curso con el nombre dado')],
          ['`/koth start <name>`', '`kronos.koth.admin`', t('Activates a zone so players can begin capturing it', 'Activa una zona para que los jugadores puedan comenzar a capturarla')],
          ['`/koth stop <name>`', '`kronos.koth.admin`', t('Deactivates an active zone immediately', 'Desactiva una zona activa de inmediato')],
          ['`/koth delete <name>`', '`kronos.koth.admin`', t('Deletes a zone permanently', 'Elimina una zona permanentemente')],
          ['`/koth list`', '`kronos.koth.use`', t('Lists every configured zone and its current state', 'Lista todas las zonas configuradas y su estado actual')],
          ['`/koth info <name>`', '`kronos.koth.use`', t('Shows region bounds, capture time, reward crate, and cooldown for a zone', 'Muestra los límites, tiempo de captura, crate de recompensa y cooldown de una zona')],
        ],
      },

      { kind: 'h2', id: 'guide', text: t('Guide: How to Create a New KOTH via Commands', 'Guía: Cómo Crear un Nuevo KOTH mediante Comandos') },
      {
        kind: 'ol',
        items: [
          t('Stand near the location where the event should take place.', 'Ubícate cerca del lugar donde debe ocurrir el evento.'),
          t('Run `/koth wand` to receive the region-selection tool.', 'Ejecuta `/koth wand` para recibir la herramienta de selección de región.'),
          t('Left-click the first corner of the outer claim region.', 'Haz clic izquierdo en la primera esquina de la región exterior de claim.'),
          t('Right-click the opposite corner of the outer claim region.', 'Haz clic derecho en la esquina opuesta de la región exterior de claim.'),
          t('Left-click the first corner of the inner capture region.', 'Haz clic izquierdo en la primera esquina de la región interior de captura.'),
          t('Right-click the opposite corner of the inner capture region.', 'Haz clic derecho en la esquina opuesta de la región interior de captura.'),
          t(
            'Run `/koth create hilltop` — the session moves from `AWAITING_NAME` to `READY` and the zone is persisted as INACTIVE.',
            'Ejecuta `/koth create hilltop` — la sesión pasa de `AWAITING_NAME` a `READY` y la zona se persiste como INACTIVE.',
          ),
          t('Run `/koth start hilltop` when ready for players to begin capturing.', 'Ejecuta `/koth start hilltop` cuando esté todo listo para que los jugadores comiencen a capturar.'),
          t(
            'Monitor progress with `/koth info hilltop` or the in-game scoreboard, which shows live capture percentage.',
            'Monitorea el progreso con `/koth info hilltop` o el scoreboard en el juego, que muestra el porcentaje de captura en vivo.',
          ),
        ],
      },

      { kind: 'h2', id: 'guice-module', text: t('Guice Module', 'Módulo de Guice') },
      {
        kind: 'code',
        lang: 'java',
        code: `bind(KothZoneCache.class).in(Singleton.class);
bind(KothCreationSessionManager.class).in(Singleton.class);
bind(KothApplicationService.class).in(Singleton.class);
bind(KothService.class).to(KothApplicationService.class);
bind(KothRepository.class).to(MongoKothRepository.class).in(Singleton.class);`,
      },
    ],
  };
}
