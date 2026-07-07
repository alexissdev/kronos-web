import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildCommonPage(): PageData {
  return {
    route: 'common',
    module: 'kronos-common',
    title: 'kronos-common',
    blocks: [
      { kind: 'h2', id: 'overview', text: t('Overview', 'Resumen') },
      {
        kind: 'p',
        html: t(
          `kronos-common has no dependency on any other Kronos module — every domain module depends on it.
          It holds the command framework, database connection factories, shared config helpers, the SOTW/EOTW
          contract, and the root exception hierarchy.`,
          `kronos-common no depende de ningún otro módulo de Kronos — todos los módulos de dominio dependen de él.
          Contiene el framework de comandos, las factorías de conexión a bases de datos, ayudantes de configuración
          compartidos, el contrato SOTW/EOTW y la jerarquía raíz de excepciones.`,
        ),
      },

      { kind: 'h2', id: 'command-framework', text: t('Command Framework', 'Framework de Comandos') },
      {
        kind: 'p',
        html: t(
          `Every top-level command (e.g. ${ic('/faction')}, ${ic('/koth')}) is a ${ic('BaseCommand')}
          registered with Bukkit. A ${ic('BaseCommand')} owns a set of ${ic('SubCommand')} instances and
          dispatches incoming arguments to the matching one.`,
          `Todo comando de nivel superior (p. ej. ${ic('/faction')}, ${ic('/koth')}) es un ${ic('BaseCommand')}
          registrado con Bukkit. Un ${ic('BaseCommand')} posee un conjunto de instancias ${ic('SubCommand')} y
          despacha los argumentos entrantes al que corresponda.`,
        ),
      },
      { kind: 'h3', id: 'basecommand-methods', text: t('BaseCommand Methods', 'Métodos de BaseCommand') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getName()`', t('The root command label, e.g. "faction"', 'La etiqueta del comando raíz, p. ej. "faction"')],
          ['`getPermission()`', t('Base permission required just to see command usage', 'Permiso base requerido solo para ver el uso del comando')],
          ['`getSubCommands()`', t('The full set of SubCommand instances bound via Multibinder', 'El conjunto completo de instancias SubCommand vinculadas vía Multibinder')],
          ['`onCommand(sender, command, label, args)`', t('Bukkit CommandExecutor entrypoint that resolves and dispatches to a SubCommand', 'Punto de entrada CommandExecutor de Bukkit que resuelve y despacha a un SubCommand')],
        ],
      },
      { kind: 'h3', id: 'subcommand-methods', text: t('SubCommand Methods', 'Métodos de SubCommand') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getName()`', t('The subcommand label, e.g. "invite"', 'La etiqueta del subcomando, p. ej. "invite"')],
          ['`getPermission()`', t('Permission node required to run this specific subcommand', 'Nodo de permiso requerido para ejecutar este subcomando específico')],
          ['`getUsage()`', t('Usage string shown on incorrect argument count', 'Cadena de uso mostrada cuando el número de argumentos es incorrecto')],
          ['`execute(sender, args)`', t('The subcommand implementation', 'La implementación del subcomando')],
        ],
      },
      { kind: 'h3', id: 'dispatch-pattern', text: 'DispatchCommand Pattern' },
      {
        kind: 'code',
        lang: 'java',
        code: `@Override
public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    if (!(sender instanceof Player) || args.length == 0) {
        sender.sendMessage(getUsage());
        return true;
    }

    Player player = (Player) sender;
    SubCommand subCommand = subCommandsByName.get(args[0].toLowerCase());

    if (subCommand == null) {
        player.sendMessage(messagesConfig.format("command.unknown-subcommand", "input", args[0]));
        return true;
    }

    if (!player.hasPermission(subCommand.getPermission())) {
        player.sendMessage(messagesConfig.getMessage("command.no-permission"));
        return true;
    }

    subCommand.execute(player, Arrays.copyOfRange(args, 1, args.length));
    return true;
}`,
      },
      { kind: 'h3', id: 'command-guide', text: t('Guide: How to Register a New Command', 'Guía: Cómo Registrar un Nuevo Comando') },
      {
        kind: 'ol',
        items: [
          t(
            'Create a class implementing `SubCommand` with a name, permission, usage string, and `execute` method.',
            'Crea una clase que implemente `SubCommand` con un nombre, permiso, cadena de uso y método `execute`.',
          ),
          t(
            "Bind it into the relevant `Multibinder<SubCommand>` set (e.g. `factionCommands`, `kothCommands`) inside that module's Guice module.",
            'Vincúlala al conjunto `Multibinder<SubCommand>` correspondiente (p. ej. `factionCommands`, `kothCommands`) dentro del módulo de Guice de ese módulo.',
          ),
          t(
            "If this is an entirely new root command, declare it in `plugin.yml` under `commands:` and register its `BaseCommand` executor in `PluginEnableHandler.registerCommands()`.",
            'Si es un comando raíz completamente nuevo, decláralo en `plugin.yml` bajo `commands:` y registra su executor `BaseCommand` en `PluginEnableHandler.registerCommands()`.',
          ),
          t(
            "Add usage and error messages for the new subcommand to `messages.yml` and reference them via `MessagesConfig`.",
            'Agrega los mensajes de uso y error del nuevo subcomando a `messages.yml` y referéncialos vía `MessagesConfig`.',
          ),
        ],
      },

      { kind: 'h2', id: 'messages-config', text: 'MessagesConfig' },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getMessage(key)`', t('Returns a single color-translated message string', 'Devuelve una única cadena de mensaje con colores traducidos')],
          ['`getMessageList(key)`', t('Returns a color-translated list of strings, for multi-line messages', 'Devuelve una lista de cadenas con colores traducidos, para mensajes multilínea')],
          ['`format(key, placeholders...)`', t('Substitutes `{name}`-style placeholders before color translation', 'Sustituye placeholders estilo `{name}` antes de traducir los colores')],
          ['`reload()`', t('re-reads messages.yml from disk into the in-memory message map', 'relee messages.yml desde disco hacia el mapa de mensajes en memoria')],
        ],
      },
      { kind: 'h3', id: 'format-example', text: t('Format Example', 'Ejemplo de Formato') },
      {
        kind: 'code',
        lang: 'yaml',
        code: `# messages.yml
faction:
  created: "&d{faction} &7has been created!"`,
      },
      {
        kind: 'code',
        lang: 'java',
        code: `player.sendMessage(messagesConfig.format("faction.created", "faction", faction.getName()));`,
      },
      { kind: 'h3', id: 'hot-reload', text: t('Hot Reload', 'Recarga en Caliente') },
      {
        kind: 'p',
        html: t(
          `${ic('MessagesConfig')} is a Guice singleton holding a mutable ${ic('Map<String, String>')}.
          Running ${ic('/kronos reload')} calls ${ic('reload()')}, which re-reads ${ic('messages.yml')} from
          disk and replaces the map contents in place. Because every caller looks the message up through
          ${ic('getMessage')} / ${ic('format')} at send time rather than caching the string, the new wording
          takes effect immediately with no plugin restart required.`,
          `${ic('MessagesConfig')} es un singleton de Guice que mantiene un ${ic('Map<String, String>')} mutable.
          Ejecutar ${ic('/kronos reload')} llama a ${ic('reload()')}, que relee ${ic('messages.yml')} desde disco
          y reemplaza el contenido del mapa en el lugar. Como cada llamador busca el mensaje mediante
          ${ic('getMessage')} / ${ic('format')} en el momento del envío en lugar de cachear la cadena, el nuevo
          texto surte efecto de inmediato sin necesidad de reiniciar el plugin.`,
        ),
      },

      { kind: 'h2', id: 'db-connection-factories', text: t('Database Connection Factories', 'Factorías de Conexión a Bases de Datos') },
      { kind: 'h3', id: 'mongo-connection-factory', text: 'MongoConnectionFactory' },
      {
        kind: 'code',
        lang: 'java',
        code: `public class MongoConnectionFactory {

    public MongoDatabase createDatabase(String connectionString, String databaseName) {
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString(connectionString))
            .build();
        MongoClient client = MongoClients.create(settings);
        return client.getDatabase(databaseName);
    }
}`,
      },
      { kind: 'h3', id: 'redis-connection-factory', text: 'RedisConnectionFactory' },
      {
        kind: 'code',
        lang: 'java',
        code: `public class RedisConnectionFactory {

    public StatefulRedisConnection<String, String> createConnection(String host, int port) {
        RedisClient client = RedisClient.create(RedisURI.builder()
            .withHost(host)
            .withPort(port)
            .build());
        return client.connect();
    }
}`,
      },

      { kind: 'h2', id: 'sotw-eotw-service', text: 'SOTW/EOTW Service' },
      {
        kind: 'p',
        html: t(
          `kronos-common defines only the ${ic('SotwService')} contract and its shared value objects. The
          concrete implementation lives in kronos-plugin as ${ic('SotwManager')}, since it needs direct access
          to the Bukkit scheduler and server-wide broadcasts.`,
          `kronos-common solo define el contrato ${ic('SotwService')} y sus objetos de valor compartidos. La
          implementación concreta vive en kronos-plugin como ${ic('SotwManager')}, ya que necesita acceso
          directo al scheduler de Bukkit y a los anuncios a nivel de servidor.`,
        ),
      },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`startSotw(durationMs)`', t('Begins a Start-of-the-World grace period, broadcasting a start message', 'Inicia un período de gracia de Start-of-the-World, anunciando un mensaje de inicio')],
          ['`startEotw(durationMs)`', t('Begins an End-of-the-World countdown, broadcasting a start message', 'Inicia una cuenta regresiva de End-of-the-World, anunciando un mensaje de inicio')],
          ['`isSotwActive()`', t('True while SOTW is running (allies cannot damage allies during this window)', 'True mientras el SOTW está activo (los aliados no pueden dañarse entre sí durante esta ventana)')],
          ['`isEotwActive()`', t('True while EOTW is running', 'True mientras el EOTW está activo')],
          ['`getRemainingMillis()`', t('Milliseconds left in whichever period is active', 'Milisegundos restantes del período que esté activo')],
          ['`cancel()`', t('Ends the active period early and broadcasts an end message', 'Termina el período activo anticipadamente y anuncia un mensaje de finalización')],
        ],
      },
      {
        kind: 'note',
        html: t(
          `${ic('SotwManager')} implements the countdown with a per-second ${ic('BukkitRunnable')}. On
          expiry it broadcasts the end message and calls ${ic('ScoreboardManager.tickAll()')} so every online
          player's scoreboard reflects the new state immediately.`,
          `${ic('SotwManager')} implementa la cuenta regresiva con un ${ic('BukkitRunnable')} por segundo. Al
          expirar, anuncia el mensaje de finalización y llama a ${ic('ScoreboardManager.tickAll()')} para que el
          scoreboard de cada jugador conectado refleje el nuevo estado de inmediato.`,
        ),
      },

      { kind: 'h2', id: 'cratetype-enum', text: t('CrateType Enum', 'Enum CrateType') },
      {
        kind: 'p',
        html: t(
          `${ic('CrateType')} is defined in kronos-common because it is a shared value referenced by both
          kronos-players (crate opening) and kronos-koth (reward delivery on capture).`,
          `${ic('CrateType')} está definido en kronos-common porque es un valor compartido referenciado tanto por
          kronos-players (apertura de crates) como por kronos-koth (entrega de recompensa al capturar).`,
        ),
      },
      {
        kind: 'table',
        headers: [t('Value', 'Valor'), t('Key Source', 'Origen de la Llave'), t('Reward Tier', 'Nivel de Recompensa')],
        rows: [
          ['`COMMON`', t('Purchased from the in-game shop', 'Comprado en la tienda del juego'), t('Low-value cosmetics and consumables', 'Cosméticos y consumibles de bajo valor')],
          ['`RARE`', t('Purchased from the in-game shop', 'Comprado en la tienda del juego'), t('Mid-tier gear and enchant books', 'Equipo de nivel medio y libros de encantamiento')],
          ['`EPIC`', t('Purchased from the in-game shop', 'Comprado en la tienda del juego'), t('High-value gear and rare cosmetics', 'Equipo de alto valor y cosméticos raros')],
          ['`LEGENDARY`', t('Purchased from the in-game shop', 'Comprado en la tienda del juego'), t('Top-tier gear, rare mounts, and titles', 'Equipo de máximo nivel, monturas raras y títulos')],
          ['`KOTH_REWARD`', t('Granted automatically on a successful KOTH capture', 'Otorgado automáticamente al capturar un KOTH con éxito'), t('Fixed reward table tied to the captured zone', 'Tabla de recompensas fija asociada a la zona capturada')],
          ['`VOTE`', t('Granted for voting on a monitoring site', 'Otorgado por votar en un sitio de monitoreo'), t('Small currency and consumable rewards', 'Pequeñas recompensas de moneda y consumibles')],
        ],
      },

      { kind: 'h2', id: 'exception-hierarchy', text: t('Exception Hierarchy', 'Jerarquía de Excepciones') },
      {
        kind: 'table',
        headers: [t('Class', 'Clase'), t('Module', 'Módulo'), t('Extends', 'Extiende'), t('When Thrown', 'Cuándo se Lanza')],
        rows: [
          ['`KronosException`', 'kronos-common', '`RuntimeException`', t('Root of every checked business-rule failure in Kronos', 'Raíz de todo fallo de regla de negocio verificado en Kronos')],
          ['`FactionNotFoundException`', 'kronos-factions', '`KronosException`', t('A faction lookup by ID or name finds nothing', 'Una búsqueda de facción por ID o nombre no encuentra nada')],
          ['`NotAFactionMemberException`', 'kronos-factions', '`KronosException`', t('An actor without faction membership attempts a member-only action', 'Un actor sin membresía de facción intenta una acción exclusiva de miembros')],
          ['`FactionPermissionException`', 'kronos-factions', '`KronosException`', t('An actor lacks the required FactionRole for an action', 'A un actor le falta el FactionRole requerido para una acción')],
          ['`InsufficientFundsException`', 'kronos-economy', '`KronosException`', t('A withdrawal or transfer exceeds the available balance', 'Un retiro o transferencia excede el saldo disponible')],
          ['`ChunkAlreadyClaimedException`', 'kronos-claims', '`KronosException`', t('A claim attempt targets a chunk that already belongs to a non-WILDERNESS claim', 'Un intento de claim apunta a un chunk que ya pertenece a un claim que no es WILDERNESS')],
          ['`ChunkNotAdjacentException`', 'kronos-claims', '`KronosException`', t("A claim attempt targets a chunk that doesn't border existing territory", 'Un intento de claim apunta a un chunk que no colinda con el territorio existente')],
          ['`FactionNotRaidableException`', 'kronos-claims', '`KronosException`', t("An overclaim targets a faction whose `raidable` flag is false", 'Un overclaim apunta a una facción cuyo indicador `raidable` es false')],
          ['`ClaimLimitReachedException`', 'kronos-claims', '`KronosException`', t("A claim attempt would exceed the faction's configured chunk limit", 'Un intento de claim excedería el límite de chunks configurado de la facción')],
          ['`NotClaimOwnerException`', 'kronos-claims', '`KronosException`', t('An actor without sufficient role attempts to unclaim territory', 'Un actor sin rol suficiente intenta liberar territorio')],
        ],
      },
    ],
  };
}
