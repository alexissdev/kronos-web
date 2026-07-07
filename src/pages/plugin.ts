import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildPluginPage(): PageData {
  return {
    route: 'plugin',
    module: 'kronos-plugin',
    title: 'kronos-plugin',
    blocks: [
      { kind: 'h2', id: 'bootstrap', text: t('Bootstrap', 'Arranque') },
      {
        kind: 'p',
        html: t(
          `${ic('HCFPlugin')} is the main ${ic('JavaPlugin')} class. On ${ic('onEnable()')} it:`,
          `${ic('HCFPlugin')} es la clase principal ${ic('JavaPlugin')}. En ${ic('onEnable()')} hace lo siguiente:`,
        ),
      },
      {
        kind: 'ol',
        items: [
          t('Loads `config.yml` from disk.', 'Carga `config.yml` desde disco.'),
          t(
            `Constructs the Guice Injector via ${ic('Guice.createInjector(new RootModule(this))')}.`,
            `Construye el Injector de Guice vía ${ic('Guice.createInjector(new RootModule(this))')}.`,
          ),
          t(`Delegates to ${ic('PluginEnableHandler.enable(injector)')}:`, `Delega en ${ic('PluginEnableHandler.enable(injector)')}:`),
        ],
      },
      {
        kind: 'ul',
        items: [
          t('Registers all Bukkit listeners (Guice instances)', 'Registra todos los listeners de Bukkit (instancias de Guice)'),
          t('Registers all commands via `getCommand("name").setExecutor(...)`', 'Registra todos los comandos vía `getCommand("name").setExecutor(...)`'),
          t('Loads MongoDB and Redis data (spawn zone, active KOTH zones, timer backups)', 'Carga datos de MongoDB y Redis (zona de spawn, zonas KOTH activas, respaldos de timers)'),
          t('Starts the ScoreboardTask (1s + 5s cycles)', 'Inicia la ScoreboardTask (ciclos de 1s + 5s)'),
          t('Registers the HCFApi implementation with Bukkit ServicesManager', 'Registra la implementación de HCFApi con el ServicesManager de Bukkit'),
        ],
      },
      {
        kind: 'p',
        html: t(
          `On ${ic('onDisable()')} it delegates to ${ic('PluginDisableHandler.disable(injector)')}:`,
          `En ${ic('onDisable()')} delega en ${ic('PluginDisableHandler.disable(injector)')}:`,
        ),
      },
      {
        kind: 'ul',
        items: [
          t('Deactivates all active KOTH zones (`KothApplicationService.deactivateAll()`)', 'Desactiva todas las zonas KOTH activas (`KothApplicationService.deactivateAll()`)'),
          t('Saves online player profiles', 'Guarda los perfiles de los jugadores conectados'),
          t('Closes MongoDB and Redis connections', 'Cierra las conexiones de MongoDB y Redis'),
        ],
      },

      { kind: 'h2', id: 'rootmodule', text: t('Guice Composition Root — RootModule', 'Raíz de Composición de Guice — RootModule') },
      {
        kind: 'p',
        html: t(
          `${ic('RootModule')} extends ${ic('AbstractModule')} and installs all domain modules:`,
          `${ic('RootModule')} extiende ${ic('AbstractModule')} e instala todos los módulos de dominio:`,
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `install(new DatabaseModule(plugin));
install(new TimersModule());
install(new PlayersModule());
install(new FactionsModule());
install(new ClaimsModule());
install(new KothModule());
install(new ClassesModule());
install(new SpawnModule());
install(new ScoreboardModule());
install(new EconomyModule(plugin));
install(new ApiModule());`,
      },
      {
        kind: 'p',
        html: t(
          `It also binds all ${ic('@Named')} configuration values from ${ic('config.yml')}
          (${ic('maxMembers')}, ${ic('inviteExpiryMs')}, ${ic('deathbanSeconds')}, etc.) and sets up a Guice
          ${ic('Multibinder')} for the faction, hcf, and pvptimer subcommand sets.`,
          `También vincula todos los valores de configuración ${ic('@Named')} desde ${ic('config.yml')}
          (${ic('maxMembers')}, ${ic('inviteExpiryMs')}, ${ic('deathbanSeconds')}, etc.) y configura un
          ${ic('Multibinder')} de Guice para los conjuntos de subcomandos de faction, hcf y pvptimer.`,
        ),
      },

      { kind: 'h2', id: 'chat-system', text: t('Chat System', 'Sistema de Chat') },
      {
        kind: 'p',
        html: t(`${ic('ChatMode')} enum: ${ic('GLOBAL')}, ${ic('FACTION')}, ${ic('ALLY')}.`, `Enum ${ic('ChatMode')}: ${ic('GLOBAL')}, ${ic('FACTION')}, ${ic('ALLY')}.`),
      },
      {
        kind: 'ul',
        items: [
          t(
            `${ic('ChatManager')} maintains a ${ic('Map<UUID, ChatMode>')} of each player's active mode.`,
            `${ic('ChatManager')} mantiene un ${ic('Map<UUID, ChatMode>')} con el modo activo de cada jugador.`,
          ),
          t(
            `${ic('ChatListener')} intercepts ${ic('AsyncPlayerChatEvent')}; if mode is FACTION or ALLY, it cancels
            the event and re-dispatches the message only to the appropriate recipients.`,
            `${ic('ChatListener')} intercepta ${ic('AsyncPlayerChatEvent')}; si el modo es FACTION o ALLY, cancela
            el evento y reenvía el mensaje solo a los destinatarios correspondientes.`,
          ),
        ],
      },

      { kind: 'h2', id: 'sotwmanager', text: 'SotwManager' },
      {
        kind: 'p',
        html: t(
          `Implements ${ic('SotwService')}. Uses a ${ic('BukkitRunnable')} countdown per period.`,
          `Implementa ${ic('SotwService')}. Usa una cuenta regresiva ${ic('BukkitRunnable')} por período.`,
        ),
      },
      {
        kind: 'ul',
        items: [
          t(
            'On start: broadcasts the SOTW/EOTW start message, schedules a per-second countdown.',
            'Al iniciar: anuncia el mensaje de inicio de SOTW/EOTW, programa una cuenta regresiva por segundo.',
          ),
          t(
            `On expiry: broadcasts the end message, calls ${ic('ScoreboardManager.tickAll()')} to refresh displays.`,
            `Al expirar: anuncia el mensaje de finalización, llama a ${ic('ScoreboardManager.tickAll()')} para refrescar las pantallas.`,
          ),
        ],
      },

      { kind: 'h2', id: 'tablistmanager', text: 'TabListManager' },
      {
        kind: 'ul',
        items: [
          t('Manages the player Tab overlay (header + footer + player name format).', 'Gestiona la superposición Tab del jugador (encabezado + pie + formato de nombre de jugador).'),
          t('Updates on join, quit, and faction change events.', 'Se actualiza en eventos de conexión, desconexión y cambio de facción.'),
          t(
            'Header shows server name and online count; footer shows tip text from MessagesConfig.',
            'El encabezado muestra el nombre del servidor y el conteo de conectados; el pie muestra un texto de ayuda desde MessagesConfig.',
          ),
        ],
      },

      { kind: 'h2', id: 'guide', text: t('Guide: How to Wire a New Module into RootModule', 'Guía: Cómo Conectar un Nuevo Módulo en RootModule') },
      {
        kind: 'ol',
        items: [
          t('Create a new Guice `AbstractModule` class (e.g. `MyFeatureModule`).', 'Crea una nueva clase `AbstractModule` de Guice (p. ej. `MyFeatureModule`).'),
          t(
            "Inside `configure()`, bind your service interface to its implementation as `Singleton`.",
            'Dentro de `configure()`, vincula tu interfaz de servicio a su implementación como `Singleton`.',
          ),
          t('In `RootModule.configure()`, add: `install(new MyFeatureModule())`.', 'En `RootModule.configure()`, agrega: `install(new MyFeatureModule())`.'),
          t(
            "If your module introduces new Bukkit listeners, add them to `PluginEnableHandler.registerListeners()`.",
            'Si tu módulo introduce nuevos listeners de Bukkit, agrégalos a `PluginEnableHandler.registerListeners()`.',
          ),
          t(
            "If your module introduces new commands, add them to `PluginEnableHandler.registerCommands()`.",
            'Si tu módulo introduce nuevos comandos, agrégalos a `PluginEnableHandler.registerCommands()`.',
          ),
        ],
      },
    ],
  };
}
