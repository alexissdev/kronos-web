import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildTimersPage(): PageData {
  return {
    route: 'timers',
    module: 'kronos-timers',
    title: 'kronos-timers',
    blocks: [
      { kind: 'h2', id: 'overview', text: t('Overview', 'Resumen') },
      {
        kind: 'p',
        html: t(
          `The timer system manages per-player, time-limited restrictions such as combat tags, PvP protection,
          and item cooldowns. Redis is the primary store (using native TTL for automatic expiry);
          MongoDB serves as a persistence backup for server restarts.`,
          `El sistema de timers gestiona restricciones por jugador y con límite de tiempo, como el combat tag, la protección PvP
          y los cooldowns de objetos. Redis es el almacén principal (usando TTL nativo para la expiración automática);
          MongoDB sirve como respaldo de persistencia ante reinicios del servidor.`,
        ),
      },

      { kind: 'h2', id: 'domain-model', text: t('Domain Model — Timer', 'Modelo de Dominio — Timer') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.timers.domain.Timer'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`playerUuid`', '`UUID`', t('The player this timer belongs to', 'El jugador al que pertenece este timer')],
          ['`type`', '`TimerType`', t('Which restriction this timer enforces', 'Qué restricción impone este timer')],
          ['`expiresAt`', '`Instant`', t('UTC instant when the timer becomes inactive', 'Instante UTC en el que el timer se vuelve inactivo')],
        ],
      },
      { kind: 'h3', id: 'timer-key-methods', text: t('Key Methods', 'Métodos Clave') },
      {
        kind: 'code',
        lang: 'java',
        code: `boolean isExpired()           // true if Instant.now() is after expiresAt
long    getRemainingMillis()  // max(0, expiresAt - now) in milliseconds`,
      },

      { kind: 'h2', id: 'timertype-enum', text: t('TimerType Enum', 'Enum TimerType') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.timers.domain.TimerType'] },
      {
        kind: 'table',
        headers: [t('Value', 'Valor'), t('Trigger', 'Disparador'), t('Effect While Active', 'Efecto Mientras Está Activo')],
        rows: [
          ['`COMBAT_TAG`', t('Player takes or deals PvP damage', 'El jugador recibe o inflige daño PvP'), t('Disconnecting causes automatic kill; duration 30s from last hit', 'Desconectarse causa muerte automática; duración de 30s desde el último golpe')],
          ['`PVP_TIMER`', t('Player connects for the first time or returns after deathban', 'El jugador se conecta por primera vez o regresa tras un deathban'), t('Player cannot deal or receive PvP damage; cancelled if the player attacks', 'El jugador no puede infligir ni recibir daño PvP; se cancela si el jugador ataca')],
          ['`ENDERPEARL`', t('Enderpearl thrown', 'Se lanza un enderpearl'), t('Cannot throw another enderpearl until cooldown expires', 'No puede lanzar otro enderpearl hasta que expire el cooldown')],
          ['`GAPPLE`', t('Golden apple consumed', 'Se consume una manzana dorada'), t('Cannot consume another golden apple until cooldown expires', 'No puede consumir otra manzana dorada hasta que expire el cooldown')],
          ['`HOME`', t('/home command issued', 'Se ejecuta el comando /home'), t('Teleport is queued; cancelled if the player moves or takes damage', 'El teletransporte queda en cola; se cancela si el jugador se mueve o recibe daño')],
          ['`CLASS_COOLDOWN`', t('Class active ability triggered', 'Se activa la habilidad activa de la clase'), t('Player cannot activate a class ability again until cooldown expires', 'El jugador no puede activar otra habilidad de clase hasta que expire el cooldown')],
          ['`LOGOUT`', t('/logout command issued', 'Se ejecuta el comando /logout'), t('Player must stay still and out of combat before safe disconnect', 'El jugador debe permanecer quieto y fuera de combate antes de desconectarse de forma segura')],
          ['`STUCK`', t('/stuck command issued', 'Se ejecuta el comando /stuck'), t('Player is teleported to safety after the timer; cancelled by damage', 'El jugador es teletransportado a un lugar seguro tras el timer; se cancela por daño')],
        ],
      },

      { kind: 'h2', id: 'storage-architecture', text: t('Storage Architecture', 'Arquitectura de Almacenamiento') },
      {
        kind: 'code',
        lang: 'text',
        code: `┌──────────────┐   findTimer()   ┌───────────────────────┐
│  TimerCache  │◄────────────────│ RedisTimerRepository  │
│  (in-memory) │                 │ key: timer:{uuid}:{type}│
│  ConcurrentHashMap             │ value: expiresAt epoch │
└──────────────┘                 │ TTL: remainingSeconds  │
       ▲                         └───────────────────────┘
       │ markActive()                        ▲
       │                          MongoDB backup (async,
       │                          fire-and-forget via
       │                          MongoTimerBackupRepository)`,
      },
      { kind: 'h3', id: 'redis-layer', text: t('Redis Layer Details', 'Detalles de la Capa Redis') },
      {
        kind: 'ul',
        items: [
          t(`Key format: ${ic('timer:{playerUuid}:{TimerType.name()}')}`, `Formato de clave: ${ic('timer:{playerUuid}:{TimerType.name()}')}`),
          t('Value: epoch milliseconds of expiresAt as a decimal string', 'Valor: milisegundos epoch de expiresAt como cadena decimal'),
          t('TTL: remainingMillis / 1000 seconds (minimum 1)', 'TTL: remainingMillis / 1000 segundos (mínimo 1)'),
          t('Expiry is fully automatic — Redis deletes the key when TTL reaches zero', 'La expiración es totalmente automática — Redis elimina la clave cuando el TTL llega a cero'),
          t(`All operations are non-blocking via Lettuce's ${ic('RedisAsyncCommands')}`, `Todas las operaciones no son bloqueantes gracias a ${ic('RedisAsyncCommands')} de Lettuce`),
        ],
      },
      { kind: 'h3', id: 'timer-cache', text: t('In-Memory Cache (TimerCache) Details', 'Detalles de la Caché en Memoria (TimerCache)') },
      {
        kind: 'ul',
        items: [
          t(`${ic('ConcurrentHashMap<UUID, Set<TimerType>>')} for O(1) active checks inside event handlers`, `${ic('ConcurrentHashMap<UUID, Set<TimerType>>')} para verificaciones O(1) dentro de los manejadores de eventos`),
          t(`${ic('ConcurrentHashMap<UUID, Map<TimerType, Long>>')} storing expiry epoch ms for countdown display`, `${ic('ConcurrentHashMap<UUID, Map<TimerType, Long>>')} que almacena el epoch ms de expiración para mostrar la cuenta regresiva`),
          t('TimerCache is a mirror only — Redis is the source of truth', 'TimerCache es solo un espejo — Redis es la fuente de verdad'),
          t(`A background task (${ic('scheduleExpiryChecks')}) runs every 40 ticks (2 seconds)`, `Una tarea en segundo plano (${ic('scheduleExpiryChecks')}) se ejecuta cada 40 ticks (2 segundos)`),
        ],
      },
      { kind: 'h3', id: 'mongo-backup', text: t('MongoDB Backup', 'Respaldo en MongoDB') },
      {
        kind: 'ul',
        items: [
          t('Written fire-and-forget after each Redis setex', 'Se escribe sin esperar confirmación (fire-and-forget) tras cada setex de Redis'),
          t('Read during loadTimersIntoCache on player join (fallback when Redis key is missing)', 'Se lee durante loadTimersIntoCache al unirse el jugador (respaldo cuando falta la clave en Redis)'),
          t('Ensures timers survive a Redis restart', 'Garantiza que los timers sobrevivan a un reinicio de Redis'),
        ],
      },

      { kind: 'h2', id: 'event-flow', text: t('Event Flow', 'Flujo de Eventos') },
      {
        kind: 'code',
        lang: 'text',
        code: `startTimer(uuid, COMBAT_TAG, 30_000)
  │
  ├─ TimerCache.markActive(uuid, COMBAT_TAG, expiresAt)
  ├─ EventBus.post(PlayerTimerStartedDomainEvent)
  └─ RedisTimerRepository.saveTimer(timer)
       └─ MongoTimerBackupRepository.save(timer)

(2 seconds later, background check)
  hasActiveTimer(uuid, COMBAT_TAG)
    └─ RedisTimerRepository.findTimer(...)
         ├─ if active   → TimerCache.markActive(...)
         └─ if expired  → TimerCache.markInactive(...)
                        → EventBus.post(PlayerTimerExpiredDomainEvent)

cancelTimer(uuid, COMBAT_TAG)
  ├─ TimerCache.markInactive(uuid, COMBAT_TAG)
  ├─ EventBus.post(PlayerTimerExpiredDomainEvent) [if was active]
  ├─ MongoTimerBackupRepository.delete(uuid, COMBAT_TAG)
  └─ RedisTimerRepository.deleteTimer(uuid, COMBAT_TAG)`,
      },
      { kind: 'h3', id: 'timers-domain-events', text: t('Domain Events', 'Eventos de Dominio') },
      {
        kind: 'table',
        headers: [t('Event', 'Evento'), t('Trigger', 'Disparador')],
        rows: [
          ['`PlayerTimerStartedDomainEvent`', t('`startTimer(...)` is called', 'Se llama a `startTimer(...)`')],
          ['`PlayerTimerExpiredDomainEvent`', t('`cancelTimer(...)` is called or cache sync detects expiry', 'Se llama a `cancelTimer(...)` o la sincronización de caché detecta la expiración')],
          ['`PlayerCombatTaggedDomainEvent`', t('`tagForCombat(tagged, tagger)` is called', 'Se llama a `tagForCombat(tagged, tagger)`')],
        ],
      },

      { kind: 'h2', id: 'convenience-methods', text: t('Convenience Methods', 'Métodos de Conveniencia') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Timer Type Started', 'Tipo de Timer Iniciado')],
        rows: [
          ['`tagForCombat(tagged, tagger)`', t('COMBAT_TAG for both players (30s)', 'COMBAT_TAG para ambos jugadores (30s)')],
          ['`startPvpTimer(uuid, durationMs)`', 'PVP_TIMER'],
          ['`startEnderpearlCooldown(uuid, durationMs)`', 'ENDERPEARL'],
          ['`startGappleCooldown(uuid, durationMs)`', 'GAPPLE'],
          ['`startLogoutTimer(uuid, durationMs)`', 'LOGOUT'],
          ['`startHomeTimer(uuid, durationMs)`', 'HOME'],
          ['`startStuckTimer(uuid, durationMs)`', 'STUCK'],
        ],
      },
      { kind: 'h3', id: 'sync-helpers', text: t('Sync Helpers (safe from Bukkit events — no I/O)', 'Ayudantes Síncronos (seguros desde eventos de Bukkit — sin E/S)') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`hasActiveTimerSync(uuid, type)`', t('Checks TimerCache only', 'Solo verifica TimerCache')],
          ['`getRemainingSeconds(uuid, type)`', t('Reads remaining ms from TimerCache / 1000', 'Lee los ms restantes de TimerCache / 1000')],
        ],
      },

      { kind: 'h2', id: 'guice-module', text: t('Guice Module', 'Módulo de Guice') },
      {
        kind: 'code',
        lang: 'java',
        code: `bind(TimerCache.class).in(Singleton.class);
bind(TimerApplicationService.class).in(Singleton.class);
bind(TimerService.class).to(TimerApplicationService.class);
bind(TimerRepository.class).to(RedisTimerRepository.class).in(Singleton.class);`,
      },

      { kind: 'h2', id: 'guide', text: t('Guide: How to Add a New TimerType', 'Guía: Cómo Agregar un Nuevo TimerType') },
      { kind: 'h3', id: 'guide-step-1', text: t('Step 1 — Add the enum value', 'Paso 1 — Agregar el valor del enum') },
      {
        kind: 'p',
        html: t(`Add the enum value in ${ic('TimerType.java')} with Javadoc.`, `Agrega el valor del enum en ${ic('TimerType.java')} con su Javadoc.`),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `public enum TimerType {
    COMBAT_TAG,
    PVP_TIMER,
    ENDERPEARL,
    GAPPLE,
    HOME,
    CLASS_COOLDOWN,
    LOGOUT,
    STUCK,

    /**
     * Prevents a player from placing a totem within the grace window
     * after entering a new claim.
     */
    TOTEM_GRACE
}`,
      },
      { kind: 'h3', id: 'guide-step-2', text: t('Step 2 — Add a duration constant (optional)', 'Paso 2 — Agregar una constante de duración (opcional)') },
      {
        kind: 'p',
        html: t(`Bind the duration via ${ic('@Named')} in ${ic('RootModule')}.`, `Vincula la duración mediante ${ic('@Named')} en ${ic('RootModule')}.`),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `bind(Long.class)
    .annotatedWith(Names.named("totemGraceDurationMs"))
    .toInstance(config.getLong("timers.totem-grace-ms", 5_000L));`,
      },
      { kind: 'h3', id: 'guide-step-3', text: t('Step 3 — Add a convenience method', 'Paso 3 — Agregar un método de conveniencia') },
      {
        kind: 'p',
        html: t(`Add a convenience method in ${ic('TimerApplicationService')}.`, `Agrega un método de conveniencia en ${ic('TimerApplicationService')}.`),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `public CompletableFuture<Void> startTotemGrace(UUID uuid, long durationMs) {
    return startTimer(uuid, TimerType.TOTEM_GRACE, durationMs);
}`,
      },
      { kind: 'h3', id: 'guide-step-4', text: t('Step 4 — Listen for the trigger event', 'Paso 4 — Escuchar el evento disparador') },
      {
        kind: 'p',
        html: t(
          `Listen for the trigger event in a Bukkit listener (inject ${ic('TimerApplicationService')} via Guice).`,
          `Escucha el evento disparador en un listener de Bukkit (inyecta ${ic('TimerApplicationService')} vía Guice).`,
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `public class TotemGraceListener implements Listener {

    private final TimerApplicationService timerService;

    @Inject
    public TotemGraceListener(TimerApplicationService timerService) {
        this.timerService = timerService;
    }

    @EventHandler
    public void onClaimEnter(PlayerClaimEnterEvent event) {
        timerService.startTotemGrace(event.getPlayer().getUniqueId(), 5_000L);
    }
}`,
      },
      { kind: 'h3', id: 'guide-step-5', text: t('Step 5 — Add a scoreboard line', 'Paso 5 — Agregar una línea al scoreboard') },
      {
        kind: 'p',
        html: t(`Add a scoreboard line in ${ic('ScoreboardRenderer.buildTimerLines')}.`, `Agrega una línea del scoreboard en ${ic('ScoreboardRenderer.buildTimerLines')}.`),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `if (timerService.hasActiveTimerSync(uuid, TimerType.TOTEM_GRACE)) {
    long seconds = timerService.getRemainingSeconds(uuid, TimerType.TOTEM_GRACE);
    lines.add(ChatColor.LIGHT_PURPLE + "Totem Grace: " + ChatColor.WHITE + seconds + "s");
}`,
      },
      { kind: 'h3', id: 'guide-step-6', text: t('Step 6 — Register the listener', 'Paso 6 — Registrar el listener') },
      {
        kind: 'p',
        html: t(
          `Register the listener in ${ic('RootModule')} and ${ic('PluginEnableHandler')}.`,
          `Registra el listener en ${ic('RootModule')} y en ${ic('PluginEnableHandler')}.`,
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `// RootModule.configure()
bind(TotemGraceListener.class).in(Singleton.class);

// PluginEnableHandler.registerListeners()
Bukkit.getPluginManager().registerEvents(
    injector.getInstance(TotemGraceListener.class), plugin);`,
      },
    ],
  };
}
