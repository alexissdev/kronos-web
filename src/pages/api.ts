import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildApiPage(): PageData {
  return {
    route: 'api',
    module: 'kronos-api',
    title: 'kronos-api',
    blocks: [
      { kind: 'h2', id: 'purpose', text: t('Purpose', 'Propósito') },
      {
        kind: 'p',
        html: t(
          `kronos-api is a small, dependency-free module that exposes a strictly read-only view of Kronos
          state to other plugins. It is registered with Bukkit's ${ic('ServicesManager')} during plugin enable,
          so external plugins never need to depend on any internal Kronos module directly — only on
          ${ic('kronos-api')}.`,
          `kronos-api es un módulo pequeño y sin dependencias que expone una vista estrictamente de solo lectura del
          estado de Kronos a otros plugins. Se registra con el ${ic('ServicesManager')} de Bukkit durante el enable
          del plugin, de modo que los plugins externos nunca necesitan depender directamente de ningún módulo
          interno de Kronos — solo de ${ic('kronos-api')}.`,
        ),
      },

      { kind: 'h2', id: 'obtaining-the-api', text: t('Obtaining the API', 'Obteniendo la API') },
      {
        kind: 'code',
        lang: 'java',
        code: `HCFApi api = Bukkit.getServicesManager().load(HCFApi.class);

if (api == null) {
    // Kronos is not installed, or has not finished enabling yet.
    getLogger().warning("Kronos API unavailable — disabling integration.");
    return;
}

FactionApi factions = api.getFactionApi();`,
      },

      { kind: 'h2', id: 'hcfapi-interface', text: 'HCFApi Interface' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.api.HCFApi'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getFactionApi()`', t('Returns the FactionApi facade', 'Devuelve la fachada FactionApi')],
          ['`getTimerApi()`', t('Returns the TimerApi facade', 'Devuelve la fachada TimerApi')],
          ['`getClaimApi()`', t('Returns the ClaimApi facade', 'Devuelve la fachada ClaimApi')],
          ['`getKothApi()`', t('Returns the KothApi facade', 'Devuelve la fachada KothApi')],
          ['`getPlayerDataApi()`', t('Returns the PlayerDataApi facade', 'Devuelve la fachada PlayerDataApi')],
        ],
      },

      { kind: 'h2', id: 'faction-api', text: 'FactionApi' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.api.facade.FactionApi'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getFactionSnapshot(factionId)`', t('Returns an immutable FactionSnapshot by internal ID', 'Devuelve un FactionSnapshot inmutable por ID interno')],
          ['`getFactionSnapshotByMember(playerUuid)`', t("Returns the snapshot of a player's current faction", 'Devuelve el snapshot de la facción actual de un jugador')],
          ['`getFactionSnapshotByName(name)`', t('Returns a snapshot by case-insensitive name lookup', 'Devuelve un snapshot mediante búsqueda por nombre sin distinguir mayúsculas/minúsculas')],
          ['`areAllies(factionIdA, factionIdB)`', t('True if the two factions have an ally relation', 'True si las dos facciones tienen una relación de aliado')],
          ['`areEnemies(factionIdA, factionIdB)`', t('True if the two factions have an enemy relation', 'True si las dos facciones tienen una relación de enemigo')],
          ['`isRaidable(factionId)`', t("True if the faction's DTK has reached zero", 'True si el DTK de la facción ha llegado a cero')],
        ],
      },

      { kind: 'h2', id: 'timer-api', text: 'TimerApi' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.api.facade.TimerApi'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getTimerSnapshot(uuid, timerType)`', t('Returns an immutable TimerSnapshot, if the timer is active', 'Devuelve un TimerSnapshot inmutable, si el timer está activo')],
          ['`hasActiveTimer(uuid, timerType)`', t('True if the given timer type is currently active for the player', 'True si el tipo de timer dado está actualmente activo para el jugador')],
          ['`getRemainingSeconds(uuid, timerType)`', t('Remaining seconds on the timer, or 0 if inactive', 'Segundos restantes del timer, o 0 si está inactivo')],
        ],
      },

      { kind: 'h2', id: 'claim-api', text: 'ClaimApi' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.api.facade.ClaimApi'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getClaimSnapshot(chunk)`', t('Returns an immutable ClaimSnapshot for the chunk', 'Devuelve un ClaimSnapshot inmutable para el chunk')],
          ['`isClaimed(chunk)`', t('True if the chunk belongs to any non-WILDERNESS claim', 'True si el chunk pertenece a algún claim que no sea WILDERNESS')],
          ['`getOwningFactionId(chunk)`', t('Returns the owning faction ID if the claim type is FACTION', 'Devuelve el ID de la facción propietaria si el tipo de claim es FACTION')],
        ],
      },

      { kind: 'h2', id: 'koth-api', text: 'KothApi' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.api.facade.KothApi'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`isZoneActive(name)`', t('True if the named zone is ACTIVE or CAPTURING', 'True si la zona nombrada está en ACTIVE o CAPTURING')],
          ['`getActiveZoneNames()`', t('Returns the names of every currently active zone', 'Devuelve los nombres de todas las zonas actualmente activas')],
          ['`getCaptureProgressPercent(name)`', t("Returns 0.0–100.0 representing the zone's current capture progress", 'Devuelve 0.0–100.0 representando el progreso de captura actual de la zona')],
        ],
      },

      { kind: 'h2', id: 'playerdata-api', text: 'PlayerDataApi' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.api.facade.PlayerDataApi'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`getKills(uuid)`', t('Total PvP kills for the player', 'Total de kills PvP del jugador')],
          ['`getDeaths(uuid)`', t('Total deaths for the player', 'Total de muertes del jugador')],
          ['`isDeathbanned(uuid)`', t('True if the player currently cannot rejoin due to deathban', 'True si el jugador actualmente no puede reconectarse por un deathban')],
          ['`getActiveKit(uuid)`', t("Returns the player's active HCF class name, if any", 'Devuelve el nombre de la clase HCF activa del jugador, si la tiene')],
        ],
      },

      { kind: 'h2', id: 'snapshot-classes', text: t('Snapshot Classes', 'Clases Snapshot') },
      {
        kind: 'p',
        html: t(
          `Every facade returns immutable snapshot objects rather than live domain entities. A snapshot is a
          copy of state at query time — it will never update, and mutating it has no effect on Kronos.`,
          `Cada fachada devuelve objetos snapshot inmutables en lugar de entidades de dominio en vivo. Un snapshot es una
          copia del estado en el momento de la consulta — nunca se actualizará, y mutarlo no tiene efecto en Kronos.`,
        ),
      },
      { kind: 'h3', id: 'timer-snapshot', text: 'TimerSnapshot' },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`playerUuid`', '`UUID`', t('The player the timer belongs to', 'El jugador al que pertenece el timer')],
          ['`type`', '`String`', t('The TimerType name, e.g. "COMBAT_TAG"', 'El nombre del TimerType, p. ej. "COMBAT_TAG"')],
          ['`expiresAt`', '`Instant`', t('UTC instant the timer becomes inactive', 'Instante UTC en que el timer se vuelve inactivo')],
          ['`remainingMillis`', '`long`', t('Milliseconds remaining at the time of the query', 'Milisegundos restantes al momento de la consulta')],
        ],
      },
      { kind: 'h3', id: 'faction-snapshot', text: 'FactionSnapshot' },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`id`', '`String`', t('Internal faction ID', 'ID interno de la facción')],
          ['`name`', '`String`', t('Display name', 'Nombre visible')],
          ['`leaderUuid`', '`UUID`', t("The leader's UUID", 'UUID del líder')],
          ['`memberCount`', '`int`', t('Number of members at query time', 'Número de miembros al momento de la consulta')],
          ['`kills`', '`int`', t('Cumulative kills', 'Kills acumulados')],
          ['`deaths`', '`int`', t('Cumulative deaths', 'Muertes acumuladas')],
          ['`dtkRemaining`', '`int`', t('Current DTK counter', 'Contador de DTK actual')],
          ['`maxDtk`', '`int`', t('DTK ceiling set at creation', 'Tope de DTK establecido en la creación')],
          ['`raidable`', '`boolean`', t('Whether the faction can currently be overclaimed', 'Si la facción puede ser overclaimeada actualmente')],
          ['`balance`', '`double`', t('Faction bank balance', 'Saldo del banco de la facción')],
        ],
      },
      { kind: 'h3', id: 'claim-snapshot', text: 'ClaimSnapshot' },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`chunkX`', '`int`', t('Chunk X coordinate', 'Coordenada X del chunk')],
          ['`chunkZ`', '`int`', t('Chunk Z coordinate', 'Coordenada Z del chunk')],
          ['`world`', '`String`', t('World name', 'Nombre del mundo')],
          ['`claimType`', '`String`', t('The ClaimType name, e.g. "FACTION" or "SAFE_ZONE"', 'El nombre del ClaimType, p. ej. "FACTION" o "SAFE_ZONE"')],
          ['`ownerFactionId`', '`Optional<String>`', t('Present only when claimType is "FACTION"', 'Presente solo cuando claimType es "FACTION"')],
        ],
      },

      { kind: 'h2', id: 'code-example', text: t('Code Example — Checking Combat Tag Before Teleport', 'Ejemplo de Código — Verificar Combat Tag Antes de Teletransportar') },
      {
        kind: 'code',
        lang: 'java',
        code: `public void onExternalTeleportCommand(Player player) {
    HCFApi api = Bukkit.getServicesManager().load(HCFApi.class);
    if (api == null) {
        player.sendMessage("Kronos is not available on this server.");
        return;
    }

    TimerApi timers = api.getTimerApi();
    if (timers.hasActiveTimer(player.getUniqueId(), "COMBAT_TAG")) {
        long remaining = timers.getRemainingSeconds(player.getUniqueId(), "COMBAT_TAG");
        player.sendMessage("You cannot teleport while combat tagged (" + remaining + "s remaining).");
        return;
    }

    performTeleport(player);
}`,
      },

      { kind: 'h2', id: 'notes-for-plugin-authors', text: t('Notes for Plugin Authors', 'Notas para Autores de Plugins') },
      {
        kind: 'ul',
        items: [
          t(
            'Every facade method is read-only — there is no API surface for mutating factions, claims, timers, or KOTH state. Player-facing actions must go through Kronos commands.',
            'Todo método de las fachadas es de solo lectura — no existe superficie de API para mutar el estado de facciones, claims, timers o KOTH. Las acciones de cara al jugador deben pasar por los comandos de Kronos.',
          ),
          t(
            `${ic('Bukkit.getServicesManager().load(HCFApi.class)')} can return ${ic('null')} if Kronos is not installed, or if your plugin's ${ic('onEnable')} runs before Kronos registers the service — declare a hard ${ic('depend')} on Kronos in your plugin.yml to guarantee load order.`,
            `${ic('Bukkit.getServicesManager().load(HCFApi.class)')} puede devolver ${ic('null')} si Kronos no está instalado, o si el ${ic('onEnable')} de tu plugin se ejecuta antes de que Kronos registre el servicio — declara un ${ic('depend')} obligatorio hacia Kronos en tu plugin.yml para garantizar el orden de carga.`,
          ),
          t(
            'Snapshot objects are copies, not live views — call the facade method again to get fresh state rather than caching a snapshot for long periods.',
            'Los objetos snapshot son copias, no vistas en vivo — vuelve a llamar al método de la fachada para obtener estado fresco en lugar de cachear un snapshot por períodos largos.',
          ),
          t(
            'All facade methods execute synchronously against in-memory caches; none of them block on MongoDB or Redis.',
            'Todos los métodos de las fachadas se ejecutan de forma síncrona contra cachés en memoria; ninguno bloquea en MongoDB ni en Redis.',
          ),
        ],
      },
    ],
  };
}
