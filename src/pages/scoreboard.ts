import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildScoreboardPage(): PageData {
  return {
    route: 'scoreboard',
    module: 'kronos-scoreboard',
    title: 'kronos-scoreboard',
    blocks: [
      { kind: 'h2', id: 'architecture', text: t('Architecture', 'Arquitectura') },
      {
        kind: 'p',
        html: t(
          `The scoreboard is driven by a single ${ic('ScoreboardTask')} running two independent Bukkit
          schedules, plus immediate refreshes triggered by domain events.`,
          `El scoreboard es impulsado por una única ${ic('ScoreboardTask')} que ejecuta dos programaciones
          independientes de Bukkit, más actualizaciones inmediatas disparadas por eventos de dominio.`,
        ),
      },
      {
        kind: 'code',
        lang: 'text',
        code: `ScoreboardTask
  ├─ every 20 ticks (1s)  → tickAll()        — refresh timers + KOTH progress from in-memory caches
  ├─ every 100 ticks (5s) → refreshStats()   — async Mongo read of kills/deaths/balance, applied on main thread
  └─ EventBus @Subscribe  → tick(uuid)       — immediate refresh for the affected player only`,
      },
      {
        kind: 'table',
        headers: [t('Component', 'Componente'), t('Responsibility', 'Responsabilidad')],
        rows: [
          ['`ScoreboardTask`', t('Owns the two BukkitRunnable schedules and dispatches refresh calls', 'Posee las dos programaciones BukkitRunnable y despacha las llamadas de actualización')],
          ['`ScoreboardManager`', t("Tracks each online player's Scoreboard instance and exposes tick/create/remove", 'Rastrea la instancia de Scoreboard de cada jugador conectado y expone tick/create/remove')],
          ['`ScoreboardRenderer`', t('Builds the ordered list of display lines for a single player', 'Construye la lista ordenada de líneas de visualización para un jugador')],
        ],
      },

      { kind: 'h2', id: 'update-cadence', text: t('Update Cadence', 'Cadencia de Actualización') },
      {
        kind: 'table',
        headers: [t('Data', 'Dato'), t('Frequency', 'Frecuencia'), t('Thread', 'Hilo')],
        rows: [
          [t('Timer countdowns (combat tag, PvP timer, etc.)', 'Cuentas regresivas de timers (combat tag, PvP timer, etc.)'), t('Every 1s (20 ticks), plus immediately on timer start/expire events', 'Cada 1s (20 ticks), más de inmediato en eventos de inicio/expiración de timer'), t('Main thread — reads TimerCache only', 'Hilo principal — solo lee TimerCache')],
          [t('KOTH capture progress', 'Progreso de captura de KOTH'), t('Every 1s (20 ticks), plus immediately on capture progress events', 'Cada 1s (20 ticks), más de inmediato en eventos de progreso de captura'), t('Main thread — reads KothZoneCache only', 'Hilo principal — solo lee KothZoneCache')],
          [t('Faction stats (kills, deaths, balance)', 'Estadísticas de facción (kills, deaths, balance)'), t('Every 5s (100 ticks)', 'Cada 5s (100 ticks)'), t('Async Mongo read, result applied via `.thenAccept` on the main thread', 'Lectura async de Mongo, resultado aplicado vía `.thenAccept` en el hilo principal')],
          [t('Active kit / class name', 'Kit / nombre de clase activo'), t('Event-driven only, on kit change', 'Solo dirigido por eventos, al cambiar de kit'), t('Main thread', 'Hilo principal')],
        ],
      },

      { kind: 'h2', id: 'sections', text: t('Sections Displayed in Order', 'Secciones Mostradas en Orden') },
      {
        kind: 'ol',
        items: [
          t('Header — server brand line', 'Encabezado — línea de marca del servidor'),
          t('Faction name', 'Nombre de la facción'),
          t('DTK remaining / max DTK', 'DTK restante / DTK máximo'),
          t('Faction balance', 'Saldo de la facción'),
          t('Active timers (one line per active timer type)', 'Timers activos (una línea por cada tipo de timer activo)'),
          t('Active KOTH capture progress, if any zone is ACTIVE or CAPTURING', 'Progreso de captura de KOTH activo, si alguna zona está ACTIVE o CAPTURING'),
          t('Footer — website or IP line from MessagesConfig', 'Pie de página — línea de sitio web o IP desde MessagesConfig'),
        ],
      },

      { kind: 'h2', id: 'eventbus-integration', text: t('EventBus Integration', 'Integración con EventBus') },
      {
        kind: 'p',
        html: t(
          'Two listeners keep the scoreboard responsive without waiting for the next 1-second cycle.',
          'Dos listeners mantienen el scoreboard responsivo sin esperar al siguiente ciclo de 1 segundo.',
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `@Subscribe
public void onTimerStarted(PlayerTimerStartedDomainEvent event) {
    scoreboardManager.tick(event.getPlayerUuid());
}

@Subscribe
public void onTimerExpired(PlayerTimerExpiredDomainEvent event) {
    scoreboardManager.tick(event.getPlayerUuid());
}`,
      },
      {
        kind: 'code',
        lang: 'java',
        code: `@Subscribe
public void onKothStarted(KothStartedDomainEvent event) {
    scoreboardManager.tickAll();
}

@Subscribe
public void onKothCaptured(KothCapturedDomainEvent event) {
    scoreboardManager.tickAll();
}`,
      },

      { kind: 'h2', id: 'koth-capture-progress', text: t('KOTH Capture Progress', 'Progreso de Captura de KOTH') },
      {
        kind: 'code',
        lang: 'java',
        code: `private String buildKothProgressLine(KothZone zone) {
    double percent = (double) zone.getCaptureProgressSeconds() / zone.getCaptureTimeSeconds() * 100.0;
    int filledBars = (int) Math.round(percent / 10.0);
    String bar = "█".repeat(filledBars) + "░".repeat(10 - filledBars);
    return ChatColor.LIGHT_PURPLE + zone.getName() + ": " + ChatColor.WHITE + bar + " " + (int) percent + "%";
}`,
      },

      { kind: 'h2', id: 'lifecycle', text: t('Lifecycle', 'Ciclo de Vida') },
      {
        kind: 'code',
        lang: 'java',
        code: `public void createBoard(Player player) {
    Scoreboard board = Bukkit.getScoreboardManager().getNewScoreboard();
    Objective objective = board.registerNewObjective("kronos", "dummy",
        ChatColor.DARK_PURPLE + "" + ChatColor.BOLD + "KRONOS HCF");
    objective.setDisplaySlot(DisplaySlot.SIDEBAR);
    player.setScoreboard(board);
    activeBoards.put(player.getUniqueId(), board);
    tick(player.getUniqueId());
}

public void removeBoard(Player player) {
    activeBoards.remove(player.getUniqueId());
    player.setScoreboard(Bukkit.getScoreboardManager().getMainScoreboard());
}`,
      },

      { kind: 'h2', id: 'guide', text: t('Guide: How to Add a New Scoreboard Line', 'Guía: Cómo Agregar una Nueva Línea al Scoreboard') },
      { kind: 'h3', id: 'guide-step-1', text: t('Step 1 — Add a build method', 'Paso 1 — Agregar un método de construcción') },
      {
        kind: 'code',
        lang: 'java',
        code: `private List<String> buildBountyLines(UUID uuid) {
    double bounty = bountyService.getBountySync(uuid);
    if (bounty <= 0) return List.of();
    return List.of(ChatColor.GOLD + "Bounty: " + ChatColor.WHITE + "$" + bounty);
}`,
      },
      { kind: 'h3', id: 'guide-step-2', text: t('Step 2 — Insert it into buildLines()', 'Paso 2 — Insertarlo en buildLines()') },
      {
        kind: 'code',
        lang: 'java',
        code: `lines.addAll(buildHeaderLines());
lines.addAll(buildFactionLines(uuid));
lines.addAll(buildBountyLines(uuid));   // new line inserted in display order
lines.addAll(buildTimerLines(uuid));
lines.addAll(buildKothLines());
lines.addAll(buildFooterLines());`,
      },
      { kind: 'h3', id: 'guide-step-3', text: t('Step 3 — Decide the refresh cadence', 'Paso 3 — Decidir la cadencia de actualización') },
      {
        kind: 'p',
        html: t(
          `If the underlying data changes rarely or is event-driven, call ${ic('scoreboardManager.tick(uuid)')}
          directly from the listener that changes it (as with timers and KOTH above). Otherwise, the existing
          1-second or 5-second cycle will pick it up automatically since it's part of ${ic('buildLines()')}.`,
          `Si el dato subyacente cambia con poca frecuencia o está dirigido por eventos, llama a
          ${ic('scoreboardManager.tick(uuid)')} directamente desde el listener que lo modifica (como con timers
          y KOTH arriba). De lo contrario, el ciclo existente de 1 o 5 segundos lo recogerá automáticamente ya
          que forma parte de ${ic('buildLines()')}.`,
        ),
      },
      { kind: 'h3', id: 'guide-step-4', text: t('Step 4 — Verify in-game', 'Paso 4 — Verificar en el juego') },
      {
        kind: 'p',
        html: t(
          'Rejoin the server or run `/scoreboard reload` (if configured) and confirm the new line appears in the correct position and updates on the expected cadence.',
          'Vuelve a unirte al servidor o ejecuta `/scoreboard reload` (si está configurado) y confirma que la nueva línea aparece en la posición correcta y se actualiza con la cadencia esperada.',
        ),
      },
    ],
  };
}
