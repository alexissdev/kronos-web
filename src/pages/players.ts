import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildPlayersPage(): PageData {
  return {
    route: 'players',
    module: 'kronos-players',
    title: 'kronos-players',
    blocks: [
      { kind: 'h2', id: 'overview', text: t('Overview', 'Resumen') },
      {
        kind: 'p',
        html: t(
          `kronos-players owns the HCF player profile: combat statistics, active kit, and deathban state.
          MongoDB is the source of truth for the profile; Redis backs the deathban flag so it can be checked
          instantly on connection without a blocking database round trip.`,
          `kronos-players es dueño del perfil de jugador HCF: estadísticas de combate, kit activo y estado de deathban.
          MongoDB es la fuente de verdad para el perfil; Redis respalda el indicador de deathban para poder
          verificarlo instantáneamente al conectarse, sin un round-trip bloqueante a la base de datos.`,
        ),
      },

      { kind: 'h2', id: 'domain-model', text: t('Domain Model — HCFPlayer', 'Modelo de Dominio — HCFPlayer') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.players.domain.HCFPlayer'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`uuid`', '`UUID`', t('The player this profile belongs to', 'El jugador al que pertenece este perfil')],
          ['`lastKnownName`', '`String`', t('Most recent username seen at join time', 'Nombre de usuario más reciente visto al unirse')],
          ['`activeKit`', '`Optional<KitType>`', t('The HCF class currently equipped, if any', 'La clase HCF actualmente equipada, si la hay')],
          ['`kills`', '`int`', t('Total PvP kills', 'Total de kills en PvP')],
          ['`deaths`', '`int`', t('Total deaths', 'Total de muertes')],
          ['`killstreak`', '`int`', t('Current consecutive kill count without dying', 'Racha actual de kills consecutivos sin morir')],
          ['`highestKillstreak`', '`int`', t('All-time best killstreak', 'Mejor racha de kills histórica')],
          ['`deathbanUntil`', '`Optional<Instant>`', t('UTC instant the current deathban expires, if any', 'Instante UTC en el que expira el deathban actual, si lo hay')],
          ['`firstJoinedAt`', '`Instant`', t('UTC instant of the very first join', 'Instante UTC de la primera conexión')],
          ['`lastSeenAt`', '`Instant`', t('UTC instant of the most recent quit', 'Instante UTC de la desconexión más reciente')],
        ],
      },
      { kind: 'h3', id: 'hcfplayer-methods', text: t('Domain Methods', 'Métodos de Dominio') },
      {
        kind: 'code',
        lang: 'java',
        code: `boolean isDeathbanned()        // deathbanUntil present and Instant.now() is before it
void    incrementKills()
void    incrementDeaths()
void    resetKillstreak()      // called from the death listener before incrementDeaths()
void    setActiveKit(KitType kit)`,
      },

      { kind: 'h2', id: 'load-save-strategy', text: t('Load / Save Strategy', 'Estrategia de Carga / Guardado') },
      {
        kind: 'code',
        lang: 'text',
        code: `PlayerJoinEvent
  │
  ├─ PlayerCache.get(uuid) miss
  ├─ MongoPlayerRepository.findByUuid(uuid)
  │     ├─ found    → HCFPlayer loaded into PlayerCache
  │     └─ not found → new HCFPlayer created and saved
  └─ DeathbanRepository.getDeathbanExpiry(uuid) merged into the cached profile

  (during play, all reads/writes hit PlayerCache — no I/O)

PlayerQuitEvent
  │
  ├─ MongoPlayerRepository.save(profile)   (async, fire-and-forget)
  └─ PlayerCache.remove(uuid)`,
      },

      { kind: 'h2', id: 'deathban-mechanic', text: t('Deathban Mechanic', 'Mecánica de Deathban') },
      {
        kind: 'p',
        html: t(
          `A deathban temporarily prevents a player from rejoining the server after dying in combat, giving
          the killer a window to loot the corpse uncontested.`,
          `Un deathban impide temporalmente que un jugador vuelva a unirse al servidor tras morir en combate, dándole
          al asesino una ventana para lootear el cadáver sin oposición.`,
        ),
      },
      {
        kind: 'ol',
        items: [
          t(
            'Player dies while `PVP_TIMER` is not active (i.e. the death counts as a real PvP death).',
            'El jugador muere mientras `PVP_TIMER` no está activo (es decir, la muerte cuenta como una muerte PvP real).',
          ),
          t('`DeathListener` calls `PlayerApplicationService.applyDeathban(uuid, durationMs)`.', '`DeathListener` llama a `PlayerApplicationService.applyDeathban(uuid, durationMs)`.'),
          t('`DeathbanRepository.setDeathban(uuid, expiresAt)` writes the expiry to Redis with a TTL.', '`DeathbanRepository.setDeathban(uuid, expiresAt)` escribe la expiración en Redis con un TTL.'),
          t(
            'The cached `HCFPlayer.deathbanUntil` field is updated immediately so in-memory checks stay consistent.',
            'El campo cacheado `HCFPlayer.deathbanUntil` se actualiza de inmediato para que las verificaciones en memoria se mantengan consistentes.',
          ),
          t(
            'On the next `AsyncPlayerPreLoginEvent`, if `isDeathbanned()` is true, the connection is denied with the remaining time shown in the kick message.',
            'En el siguiente `AsyncPlayerPreLoginEvent`, si `isDeathbanned()` es true, se deniega la conexión mostrando el tiempo restante en el mensaje de expulsión.',
          ),
        ],
      },
      { kind: 'h3', id: 'admin-removal', text: t('Admin Removal', 'Remoción por Admin') },
      {
        kind: 'p',
        html: t(
          `Staff can lift a deathban early with ${ic('/deathban remove <player>')}, which deletes the Redis
          key via ${ic('DeathbanRepository.clearDeathban(uuid)')} and clears the cached ${ic('deathbanUntil')} field.`,
          `El staff puede levantar un deathban anticipadamente con ${ic('/deathban remove <player>')}, lo cual elimina la
          clave de Redis vía ${ic('DeathbanRepository.clearDeathban(uuid)')} y limpia el campo cacheado ${ic('deathbanUntil')}.`,
        ),
      },
      { kind: 'h3', id: 'deathban-redis-schema', text: t('DeathbanRepository Redis Schema', 'Esquema Redis de DeathbanRepository') },
      {
        kind: 'table',
        headers: [t('Key', 'Clave'), t('Value', 'Valor'), 'TTL'],
        rows: [
          ['`deathban:{playerUuid}`', t('epoch milliseconds of expiresAt as a decimal string', 'milisegundos epoch de expiresAt como cadena decimal'), t('remainingMillis / 1000 seconds', 'remainingMillis / 1000 segundos')],
        ],
      },

      { kind: 'h2', id: 'crate-system', text: t('Crate System', 'Sistema de Crates') },
      { kind: 'h3', id: 'crate-location', text: 'CrateLocation' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.players.domain.CrateLocation'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`id`', '`String`', t('Immutable UUID-as-string assigned at creation', 'UUID inmutable como string, asignado en la creación')],
          ['`location`', '`BlockPosition`', t('World, x, y, z of the physical crate block', 'Mundo, x, y, z del bloque físico del crate')],
          ['`crateType`', '`CrateType`', t('Which reward table this crate rolls from', 'De qué tabla de recompensas sortea este crate')],
          ['`createdAt`', '`Instant`', t('UTC creation timestamp', 'Marca de tiempo UTC de creación')],
        ],
      },
      { kind: 'h3', id: 'cratetype-enum', text: t('CrateType Enum', 'Enum CrateType') },
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
      { kind: 'h3', id: 'crate-service', text: t('CrateService Interface', 'Interfaz CrateService') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`registerCrateLocation(location, crateType)`', t('Persists a new physical crate block', 'Persiste un nuevo bloque físico de crate')],
          ['`removeCrateLocation(location)`', t('Deletes the crate block registration at a location', 'Elimina el registro de crate en una ubicación')],
          ['`openCrate(uuid, crateType)`', t('Consumes one key and rolls a reward from the given table', 'Consume una llave y sortea una recompensa de la tabla dada')],
          ['`getCrateLocations(crateType)`', t('Returns every registered location for a crate type', 'Devuelve todas las ubicaciones registradas para un tipo de crate')],
          ['`giveCrateKey(uuid, crateType, amount)`', t('Grants virtual keys of a type to a player', 'Otorga llaves virtuales de un tipo a un jugador')],
        ],
      },
      { kind: 'h3', id: 'crate-opening-flow', text: t('Crate Opening Flow', 'Flujo de Apertura de Crate') },
      {
        kind: 'code',
        lang: 'text',
        code: `Player right-clicks a registered crate block while holding a matching key
  │
  ├─ CrateApplicationService.openCrate(uuid, crateType)
  │     ├─ verify the player holds at least one key of crateType
  │     ├─ consume one key from their inventory
  │     ├─ roll a weighted reward from the CrateType's reward table
  │     └─ deliver the reward (item, currency, or effect) to the player
  └─ broadcast: "<player> opened a <crateType> crate and won <reward>!"`,
      },
      { kind: 'h3', id: 'crate-admin-commands', text: t('Admin Commands', 'Comandos de Admin') },
      {
        kind: 'table',
        headers: [t('Command', 'Comando'), t('Description', 'Descripción')],
        rows: [
          ['`/crate setloc <type>`', t('Registers the block the admin is looking at as a crate of the given type', 'Registra el bloque al que mira el admin como un crate del tipo dado')],
          ['`/crate removeloc`', t('Removes the crate registration at the targeted block', 'Elimina el registro de crate en el bloque apuntado')],
          ['`/crate give <player> <type> <amount>`', t('Grants virtual keys to a player', 'Otorga llaves virtuales a un jugador')],
          ['`/crate list`', t('Lists every registered crate location grouped by type', 'Lista todas las ubicaciones de crate registradas agrupadas por tipo')],
        ],
      },

      { kind: 'h2', id: 'kit-system', text: t('Kit System', 'Sistema de Kits') },
      {
        kind: 'p',
        html: t(
          `${ic('HCFPlayer.activeKit')} is the single field that ties a player to their chosen HCF class from
          kronos-classes. When a player runs ${ic('/class <name>')}, ${ic('KitApplicationService')} (in kronos-classes)
          calls ${ic('PlayerApplicationService.setActiveKit(uuid, kitType)')}, which updates the cached profile and
          persists it. On respawn, ${ic('ClassListener')} reads ${ic('activeKit')} back from ${ic('PlayerCache')} to
          decide which starting kit and passive effects to reapply.`,
          `${ic('HCFPlayer.activeKit')} es el único campo que vincula a un jugador con su clase HCF elegida en
          kronos-classes. Cuando un jugador ejecuta ${ic('/class <name>')}, ${ic('KitApplicationService')} (en kronos-classes)
          llama a ${ic('PlayerApplicationService.setActiveKit(uuid, kitType)')}, que actualiza el perfil cacheado y lo
          persiste. Al reaparecer, ${ic('ClassListener')} lee ${ic('activeKit')} de vuelta desde ${ic('PlayerCache')} para
          decidir qué kit inicial y efectos pasivos reaplicar.`,
        ),
      },

      { kind: 'h2', id: 'services', text: t('PlayerService Interface', 'Interfaz PlayerService') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getPlayer(uuid)`', t('Returns the cached HCFPlayer, if loaded', 'Devuelve el HCFPlayer cacheado, si está cargado')],
          ['`getOrCreatePlayer(uuid, name)`', t('Loads from Mongo or creates a fresh profile on first join', 'Carga desde Mongo o crea un perfil nuevo en la primera conexión')],
          ['`savePlayer(profile)`', t('Persists the profile to MongoDB', 'Persiste el perfil en MongoDB')],
          ['`applyDeathban(uuid, durationMs)`', t('Sets a deathban in Redis and updates the cached profile', 'Establece un deathban en Redis y actualiza el perfil cacheado')],
          ['`removeDeathban(uuid)`', t('Clears a deathban early (admin action)', 'Levanta un deathban anticipadamente (acción de admin)')],
          ['`isDeathbanned(uuid)`', t('Sync check against the cached profile — safe for login events', 'Verificación síncrona contra el perfil cacheado — segura para eventos de login')],
          ['`setActiveKit(uuid, kitType)`', t('Updates and persists the equipped HCF class', 'Actualiza y persiste la clase HCF equipada')],
          ['`incrementKills(uuid)`', t('Increments kills and killstreak, updating highestKillstreak if exceeded', 'Incrementa kills y killstreak, actualizando highestKillstreak si se supera')],
          ['`incrementDeaths(uuid)`', t('Increments deaths and resets killstreak to zero', 'Incrementa deaths y reinicia killstreak a cero')],
        ],
      },

      { kind: 'h2', id: 'guice-module', text: t('Guice Module', 'Módulo de Guice') },
      {
        kind: 'code',
        lang: 'java',
        code: `bind(PlayerCache.class).in(Singleton.class);
bind(PlayerApplicationService.class).in(Singleton.class);
bind(PlayerService.class).to(PlayerApplicationService.class);
bind(PlayerRepository.class).to(MongoPlayerRepository.class).in(Singleton.class);
bind(DeathbanRepository.class).to(RedisDeathbanRepository.class).in(Singleton.class);
bind(CrateApplicationService.class).in(Singleton.class);
bind(CrateService.class).to(CrateApplicationService.class);`,
      },
    ],
  };
}
