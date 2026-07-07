import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildSpawnPage(): PageData {
  return {
    route: 'spawn',
    module: 'kronos-spawn',
    title: 'kronos-spawn',
    blocks: [
      { kind: 'h2', id: 'overview', text: t('Overview', 'Resumen') },
      {
        kind: 'p',
        html: t(
          `kronos-spawn protects a single cuboid region — the server's central spawn — from PvP, griefing,
          and item loss, and provides the teleport point new and returning players land on.`,
          `kronos-spawn protege una única región cuboide — el spawn central del servidor — contra PvP, griefing
          y pérdida de ítems, y provee el punto de teletransporte donde caen los jugadores nuevos y los que regresan.`,
        ),
      },

      { kind: 'h2', id: 'domain-model', text: t('Domain Model — SpawnZone', 'Modelo de Dominio — SpawnZone') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.spawn.domain.SpawnZone'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`id`', '`String`', t('Fixed singleton identifier — only one SpawnZone exists per server', 'Identificador singleton fijo — solo existe un SpawnZone por servidor')],
          ['`world`', '`String`', t('World the region is defined in', 'Mundo en el que está definida la región')],
          ['`region`', '`Cuboid`', t('Minimum and maximum corner of the protected cuboid', 'Esquina mínima y máxima del cuboide protegido')],
          ['`spawnLocation`', '`Location`', t('Exact point players are teleported to', 'Punto exacto al que se teletransportan los jugadores')],
          ['`createdAt`', '`Instant`', t('UTC instant the zone was first defined', 'Instante UTC en que se definió la zona por primera vez')],
        ],
      },
      { kind: 'h3', id: 'contains-method', text: t('The contains() Method', 'El Método contains()') },
      {
        kind: 'p',
        html: t(
          `${ic('boolean contains(Location location)')} returns true when the location's world matches
          ${ic('world')} and its x, y, and z coordinates each fall between the cuboid's minimum and maximum
          corners (inclusive). Every protection listener calls this method first to decide whether its
          cancellation logic applies.`,
          `${ic('boolean contains(Location location)')} devuelve true cuando el mundo de la ubicación coincide
          con ${ic('world')} y sus coordenadas x, y, z caen entre las esquinas mínima y máxima del cuboide
          (inclusive). Todo listener de protección llama primero a este método para decidir si aplica su
          lógica de cancelación.`,
        ),
      },

      { kind: 'h2', id: 'wand-session-flow', text: t('How the Spawn Zone is Defined', 'Cómo se Define la Zona de Spawn') },
      {
        kind: 'p',
        html: t(
          `Defining spawn uses the same wand-session pattern as kronos-koth, but simpler — there is only
          one region and one teleport point to set.`,
          `Definir el spawn usa el mismo patrón de sesión con varita que kronos-koth, pero más simple — solo hay
          que configurar una región y un punto de teletransporte.`,
        ),
      },
      {
        kind: 'code',
        lang: 'text',
        code: `/spawn wand
  │  (left-click with wand)
  ▼
AWAITING_POS1
  │  (right-click with wand)
  ▼
AWAITING_POS2
  │  (/spawn create)
  ▼
SpawnZone { region } persisted, spawnLocation defaults to current position
  │  (/spawn setlocation, optional — run standing at the desired teleport point)
  ▼
SpawnZone { spawnLocation } updated`,
      },

      { kind: 'h2', id: 'protections', text: t('Protections Inside Spawn', 'Protecciones Dentro del Spawn') },
      {
        kind: 'table',
        headers: [t('Event', 'Evento'), t('Behaviour', 'Comportamiento')],
        rows: [
          ['`BlockBreakEvent`', t('Cancelled unless the player has `kronos.spawn.bypass`', 'Cancelado a menos que el jugador tenga `kronos.spawn.bypass`')],
          ['`BlockPlaceEvent`', t('Cancelled unless the player has `kronos.spawn.bypass`', 'Cancelado a menos que el jugador tenga `kronos.spawn.bypass`')],
          ['`EntityDamageByEntityEvent`', t('Cancelled when both parties are inside the spawn region, preventing all PvP', 'Cancelado cuando ambas partes están dentro de la región de spawn, previniendo todo PvP')],
          ['`PlayerDropItemEvent`', t('Cancelled to prevent item loss and floor clutter near spawn', 'Cancelado para prevenir pérdida de ítems y desorden en el suelo cerca del spawn')],
          ['`EntityExplodeEvent`', t('Cancelled when the explosion origin is inside the spawn region', 'Cancelado cuando el origen de la explosión está dentro de la región de spawn')],
          ['`BlockIgniteEvent`', t('Cancelled to prevent fire spread damaging spawn builds', 'Cancelado para prevenir que el fuego dañe las construcciones del spawn')],
        ],
      },

      { kind: 'h2', id: 'services', text: t('SpawnService Interface', 'Interfaz SpawnService') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`defineRegion(pos1, pos2)`', t('Persists the protected cuboid from two opposite corners', 'Persiste el cuboide protegido a partir de dos esquinas opuestas')],
          ['`setSpawnLocation(location)`', t('Updates the exact teleport point', 'Actualiza el punto exacto de teletransporte')],
          ['`getSpawnZone()`', t('Returns the current SpawnZone, if one has been defined', 'Devuelve el SpawnZone actual, si se ha definido uno')],
          ['`teleportToSpawn(player)`', t('Teleports a player to `spawnLocation`', 'Teletransporta a un jugador a `spawnLocation`')],
          ['`isInsideSpawn(location)`', t('Delegates to `SpawnZone.contains(location)`', 'Delega en `SpawnZone.contains(location)`')],
        ],
      },

      { kind: 'h2', id: 'admin-commands', text: t('Admin Commands', 'Comandos de Admin') },
      {
        kind: 'table',
        headers: [t('Command', 'Comando'), t('Permission', 'Permiso'), t('Description', 'Descripción')],
        rows: [
          ['`/spawn wand`', '`kronos.spawn.admin`', t('Gives the admin the region-selection wand', 'Entrega al admin la varita de selección de región')],
          ['`/spawn create`', '`kronos.spawn.admin`', t('Persists the region selected with the wand', 'Persiste la región seleccionada con la varita')],
          ['`/spawn setlocation`', '`kronos.spawn.admin`', t("Sets the teleport point to the admin's current position", 'Establece el punto de teletransporte en la posición actual del admin')],
          ['`/spawn info`', '`kronos.spawn.admin`', t('Shows region bounds and the current teleport point', 'Muestra los límites de la región y el punto de teletransporte actual')],
          ['`/spawn tp`', '`kronos.spawn.use`', t('Teleports the sender to spawn', 'Teletransporta a quien ejecuta el comando al spawn')],
        ],
      },

      { kind: 'h2', id: 'guice-module', text: t('Guice Module', 'Módulo de Guice') },
      {
        kind: 'code',
        lang: 'java',
        code: `bind(SpawnZoneCache.class).in(Singleton.class);
bind(SpawnApplicationService.class).in(Singleton.class);
bind(SpawnService.class).to(SpawnApplicationService.class);
bind(SpawnRepository.class).to(MongoSpawnRepository.class).in(Singleton.class);`,
      },
    ],
  };
}
