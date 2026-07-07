import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildFactionsPage(): PageData {
  return {
    route: 'factions',
    module: 'kronos-factions',
    title: 'kronos-factions',
    blocks: [
      { kind: 'h2', id: 'overview', text: t('Overview', 'Resumen') },
      {
        kind: 'p',
        html: t(
          `The faction system is the core of Hardcore Factions gameplay. It manages player groups,
          their territory power (DTK), diplomatic relations, economy, and the raid lifecycle.`,
          `El sistema de facciones es el núcleo del juego Hardcore Factions. Gestiona los grupos de jugadores,
          su poder territorial (DTK), las relaciones diplomáticas, la economía y el ciclo de vida de los raids.`,
        ),
      },

      { kind: 'h2', id: 'domain-model', text: t('Domain Model — Faction', 'Modelo de Dominio — Faction') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.factions.domain.Faction'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`id`', '`String`', t('Immutable UUID-as-string assigned at creation', 'UUID inmutable como string, asignado en la creación')],
          ['`name`', '`String`', t('Public display name (mutable by leader)', 'Nombre público visible (modificable por el líder)')],
          ['`leaderId`', '`UUID`', t("Current leader's UUID", 'UUID del líder actual')],
          ['`members`', '`Map<UUID, FactionMember>`', t('All members keyed by UUID', 'Todos los miembros indexados por UUID')],
          ['`allies`', '`Set<String>`', t('IDs of allied factions', 'IDs de facciones aliadas')],
          ['`enemies`', '`Set<String>`', t('IDs of enemy factions', 'IDs de facciones enemigas')],
          ['`balance`', '`double`', t('Faction bank balance', 'Saldo del banco de la facción')],
          ['`kills`', '`int`', t('Cumulative kills by all members', 'Kills acumulados por todos los miembros')],
          ['`deaths`', '`int`', t('Cumulative deaths by all members', 'Muertes acumuladas por todos los miembros')],
          ['`dtkRemaining`', '`int`', t('Deaths-To-Kick counter (starts at maxDtk)', 'Contador de Deaths-To-Kick (comienza en maxDtk)')],
          ['`maxDtk`', '`int`', t('Max DTK when faction was created (default: 20)', 'DTK máximo al crear la facción (por defecto: 20)')],
          ['`createdAt`', '`Instant`', t('UTC creation timestamp', 'Marca de tiempo UTC de creación')],
          ['`home`', '`FactionHome`', t('Optional teleport home location', 'Ubicación opcional de teletransporte al home')],
          ['`strikes`', '`int`', t('Admin-applied strike count (max 3 before auto-disband)', 'Contador de strikes aplicados por admins (máx. 3 antes de la disolución automática)')],
          ['`frozen`', '`boolean`', t('If true, no new members and no deposits', 'Si es true, no se admiten nuevos miembros ni depósitos')],
          ['`raidable`', '`boolean`', t('If true, enemies can overclaim territory', 'Si es true, los enemigos pueden hacer overclaim del territorio')],
        ],
      },
      { kind: 'h3', id: 'faction-key-methods', text: t('Key Business Methods', 'Métodos de Negocio Clave') },
      {
        kind: 'code',
        lang: 'java',
        code: `boolean decrementDtk()
boolean isAtDtk()
boolean isAtMaxStrikes()
void    addMember(FactionMember)
void    removeMember(UUID)
Optional<FactionMember> getMember(UUID)
void    addAlly(String factionId)
void    addEnemy(String factionId)
void    deposit(double amount)
void    withdraw(double amount)`,
      },

      { kind: 'h2', id: 'role-hierarchy', text: t('FactionRole Hierarchy', 'Jerarquía de FactionRole') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.factions.domain.FactionRole'] },
      {
        kind: 'table',
        headers: [t('Role', 'Rol'), t('Priority', 'Prioridad'), t('Permissions', 'Permisos')],
        rows: [
          ['`LEADER`', '4', t('All permissions; can disband, transfer leadership, rename', 'Todos los permisos; puede disolver, transferir el liderazgo y renombrar')],
          ['`CO_LEADER`', '3', t('Can set roles (below own level), manage relations, withdraw funds', 'Puede asignar roles (por debajo de su nivel), gestionar relaciones y retirar fondos')],
          ['`CAPTAIN`', '2', t('Can invite, kick members, set/clear faction home, claim territory', 'Puede invitar, expulsar miembros, definir/limpiar el home de la facción y reclamar territorio')],
          ['`MEMBER`', '1', t('No administrative permissions', 'Sin permisos administrativos')],
        ],
      },
      { kind: 'h3', id: 'permission-check-example', text: t('Permission Check Example', 'Ejemplo de Verificación de Permisos') },
      {
        kind: 'code',
        lang: 'java',
        code: `if (!actor.getRole().isAtLeast(FactionRole.CAPTAIN)) {
    throw new FactionPermissionException(required);
}`,
      },
      {
        kind: 'note',
        html: t('CO_LEADER cannot assign a role equal to or higher than their own.', 'CO_LEADER no puede asignar un rol igual o superior al suyo propio.'),
      },

      { kind: 'h2', id: 'faction-member', text: 'FactionMember' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.factions.domain.FactionMember'] },
      {
        kind: 'p',
        html: t(
          `Fields: ${ic('uuid')} (${ic('UUID')}), ${ic('role')} (${ic('FactionRole')}), ${ic('joinedAt')} (${ic('Instant')}).`,
          `Campos: ${ic('uuid')} (${ic('UUID')}), ${ic('role')} (${ic('FactionRole')}), ${ic('joinedAt')} (${ic('Instant')}).`,
        ),
      },
      {
        kind: 'note',
        html: t(
          'FactionMember instances live embedded inside the Faction aggregate and are not persisted independently.',
          'Las instancias de FactionMember viven embebidas dentro del agregado Faction y no se persisten de forma independiente.',
        ),
      },

      { kind: 'h2', id: 'dtk-mechanic', text: t('DTK Mechanic (Deaths To Kick)', 'Mecánica de DTK (Deaths To Kick)') },
      {
        kind: 'p',
        html: t('DTK is the primary mechanic that governs when a faction can be raided.', 'El DTK es la mecánica principal que determina cuándo una facción puede ser raideada.'),
      },
      {
        kind: 'ol',
        items: [
          t('A faction member dies in PvP.', 'Un miembro de la facción muere en PvP.'),
          t(`${ic('FactionApplicationService.notifyMemberDeath(factionId, deadMemberUuid)')} is called.`, `Se llama a ${ic('FactionApplicationService.notifyMemberDeath(factionId, deadMemberUuid)')}.`),
          t(`${ic('faction.incrementDeaths()')} is called unconditionally.`, `Se llama a ${ic('faction.incrementDeaths()')} incondicionalmente.`),
          t(`If the dead player is a faction member, ${ic('faction.decrementDtk()')} is called.`, `Si el jugador muerto es miembro de la facción, se llama a ${ic('faction.decrementDtk()')}.`),
          t(
            `If ${ic('faction.isAtDtk()')} returns true and the faction is not yet raidable: ${ic('faction.setRaidable(true)')}, then ${ic('EventBus.post(new FactionRaidableDomainEvent(factionId, name))')}.`,
            `Si ${ic('faction.isAtDtk()')} devuelve true y la facción aún no es raideable: ${ic('faction.setRaidable(true)')}, y luego ${ic('EventBus.post(new FactionRaidableDomainEvent(factionId, name))')}.`,
          ),
          t(
            `${ic('EventBus.post(new FactionDtkDecrementedDomainEvent(...))')} is always posted when DTK changes.`,
            `${ic('EventBus.post(new FactionDtkDecrementedDomainEvent(...))')} siempre se publica cuando cambia el DTK.`,
          ),
        ],
      },
      {
        kind: 'note',
        html: t(
          `When a faction is raidable, enemies can call ${ic('ClaimApplicationService.overclaim(...)')} on its chunks.`,
          `Cuando una facción es raideable, los enemigos pueden llamar a ${ic('ClaimApplicationService.overclaim(...)')} sobre sus chunks.`,
        ),
      },

      { kind: 'h2', id: 'ally-enemy-relations', text: t('Ally and Enemy Relations', 'Relaciones de Aliados y Enemigos') },
      {
        kind: 'p',
        html: t("Relations are bidirectional and stored in each faction's allies/enemies sets.", 'Las relaciones son bidireccionales y se almacenan en los sets allies/enemies de cada facción.'),
      },
      {
        kind: 'ul',
        items: [
          t(
            `${ic('setAlly')} flow: load both factions in parallel → remove existing enemy relation → add ally on both sides → save both.`,
            `Flujo de ${ic('setAlly')}: cargar ambas facciones en paralelo → eliminar la relación de enemigo existente → agregar aliado en ambos lados → guardar ambas.`,
          ),
          t(`${ic('setEnemy')} flow: same but populates enemies and removes from allies.`, `Flujo de ${ic('setEnemy')}: igual, pero puebla enemies y elimina de allies.`),
          t(`${ic('removeRelation')}: removes both ally and enemy entry on both sides.`, `${ic('removeRelation')}: elimina tanto la entrada de aliado como de enemigo en ambos lados.`),
          t(
            'Ally protection: while SOTW is not active, allies cannot deal damage to each other.',
            'Protección de aliados: mientras el SOTW no está activo, los aliados no pueden dañarse entre sí.',
          ),
        ],
      },

      { kind: 'h2', id: 'faction-bank', text: t('Faction Bank', 'Banco de la Facción') },
      {
        kind: 'table',
        headers: [t('Operation', 'Operación'), t('Minimum Role', 'Rol Mínimo'), t('Description', 'Descripción')],
        rows: [
          ['`deposit(factionId, playerUuid, amount)`', 'MEMBER', t('Withdraws from player via EconomyService.withdraw; adds to faction.balance', 'Retira del jugador vía EconomyService.withdraw; suma a faction.balance')],
          ['`withdraw(factionId, playerUuid, amount)`', 'CO_LEADER', t('Deducts from faction.balance; deposits to player via EconomyService.deposit', 'Resta de faction.balance; deposita al jugador vía EconomyService.deposit')],
        ],
      },
      {
        kind: 'note',
        html: t(
          'Deposits fail if frozen. Withdrawals fail if faction.balance &lt; amount (throws InsufficientFundsException).',
          'Los depósitos fallan si la facción está frozen. Los retiros fallan si faction.balance &lt; amount (lanza InsufficientFundsException).',
        ),
      },

      { kind: 'h2', id: 'invite-cooldown-system', text: t('Invite and Cooldown System', 'Sistema de Invitaciones y Cooldowns') },
      {
        kind: 'p',
        html: t(
          'Four in-memory ConcurrentHashMap structures track invite and re-invite state:',
          'Cuatro estructuras ConcurrentHashMap en memoria rastrean el estado de invitaciones y reinvitaciones:',
        ),
      },
      {
        kind: 'table',
        headers: [t('Map', 'Mapa'), t('Key', 'Clave'), t('Value', 'Valor'), t('Purpose', 'Propósito')],
        rows: [
          ['`pendingInvites`', t('invitee UUID', 'UUID del invitado'), 'factionId', t('Tracks which faction invited the player', 'Rastrea qué facción invitó al jugador')],
          ['`inviteTimestamps`', t('invitee UUID', 'UUID del invitado'), 'currentTimeMs', t('When the invite was sent', 'Cuándo se envió la invitación')],
          ['`leftFactionTimestamps`', t('player UUID', 'UUID del jugador'), 'currentTimeMs', t('Used for re-invite cooldown', 'Usado para el cooldown de reinvitación')],
          ['`leftFactionIds`', t('player UUID', 'UUID del jugador'), 'factionId', t('Tracks which faction the player left', 'Rastrea qué facción abandonó el jugador')],
        ],
      },
      {
        kind: 'ul',
        items: [
          t(
            `Validation on ${ic('inviteMember')}: actor must be CAPTAIN+; faction not frozen; faction not full; invitee not in any faction; re-invite cooldown elapsed.`,
            `Validación en ${ic('inviteMember')}: el actor debe ser CAPTAIN o superior; la facción no debe estar frozen; la facción no debe estar llena; el invitado no debe estar en ninguna facción; debe haber pasado el cooldown de reinvitación.`,
          ),
          t(
            `Validation on ${ic('acceptInvite')}: pending invite from target faction must exist; invite not expired; faction still has room.`,
            `Validación en ${ic('acceptInvite')}: debe existir una invitación pendiente de la facción objetivo; la invitación no debe haber expirado; la facción debe tener cupo aún.`,
          ),
        ],
      },

      { kind: 'h2', id: 'domain-events', text: t('Domain Events', 'Eventos de Dominio') },
      {
        kind: 'table',
        headers: [t('Event', 'Evento'), t('Trigger', 'Disparador'), t('Fields', 'Campos')],
        rows: [
          ['`FactionCreatedDomainEvent`', '`createFaction(...)`', 'factionId, factionName, leaderUuid'],
          ['`FactionDisbandedDomainEvent`', t('`disbandFaction(...)` or max strikes', '`disbandFaction(...)` o strikes máximos'), 'factionId, factionName, actorUuid'],
          ['`FactionRaidableDomainEvent`', t('DTK reaches 0', 'El DTK llega a 0'), 'factionId, factionName'],
          ['`FactionDtkDecrementedDomainEvent`', '`notifyMemberDeath(...)`', 'factionId, factionName, dtkRemaining, maxDtk'],
          ['`PlayerJoinedFactionDomainEvent`', '`acceptInvite(...)`', 'playerUuid, factionId'],
          ['`PlayerLeftFactionDomainEvent`', '`kickMember(...)` or `leaveFaction(...)`', 'playerUuid, factionId, wasKicked'],
        ],
      },

      { kind: 'h2', id: 'services', text: t('Persistence — FactionRepository', 'Persistencia — FactionRepository') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.factions.repository.FactionRepository'] },
      {
        kind: 'p',
        html: t(
          `Implemented by ${ic('MongoFactionRepository')}. All methods are async (${ic('CompletableFuture')}).`,
          `Implementado por ${ic('MongoFactionRepository')}. Todos los métodos son asíncronos (${ic('CompletableFuture')}).`,
        ),
      },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`findById(id)`', t('Find by internal ID', 'Busca por ID interno')],
          ['`findByName(name)`', t('Case-insensitive name lookup', 'Búsqueda por nombre sin distinguir mayúsculas/minúsculas')],
          ['`findByMember(playerUuid)`', t('Find the faction containing the player', 'Encuentra la facción que contiene al jugador')],
          ['`findTopByKills(limit)`', t('Top N factions ordered by kills desc', 'Top N facciones ordenadas por kills descendente')],
          ['`findRaidable()`', t('All factions with raidable = true', 'Todas las facciones con raidable = true')],
          ['`save(faction)`', t('Upsert', 'Upsert (inserta o actualiza)')],
          ['`delete(id)`', t('Hard delete', 'Eliminación definitiva')],
        ],
      },

      { kind: 'h2', id: 'guide', text: t('Guide: How to Add a New Faction Action', 'Guía: Cómo Agregar una Nueva Acción de Facción') },
      { kind: 'h3', id: 'guide-step-1', text: t('Step 1 — Define the request', 'Paso 1 — Definir la solicitud') },
      {
        kind: 'p',
        html: t(
          'Add a method signature to the FactionService interface describing the action, returning a CompletableFuture.',
          'Agrega una firma de método a la interfaz FactionService que describa la acción, devolviendo un CompletableFuture.',
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `CompletableFuture<Void> renameFaction(String factionId, UUID actorUuid, String newName);`,
      },
      { kind: 'h3', id: 'guide-step-2', text: t('Step 2 — Implement in FactionApplicationService', 'Paso 2 — Implementar en FactionApplicationService') },
      {
        kind: 'code',
        lang: 'java',
        code: `@Override
public CompletableFuture<Void> renameFaction(String factionId, UUID actorUuid, String newName) {
    return factionRepository.findById(factionId).thenCompose(opt -> {
        Faction faction = opt.orElseThrow(() -> new FactionNotFoundException(factionId));
        FactionMember actor = faction.getMember(actorUuid)
            .orElseThrow(() -> new NotAFactionMemberException(actorUuid));

        if (!actor.getRole().isAtLeast(FactionRole.LEADER)) {
            throw new FactionPermissionException(FactionRole.LEADER);
        }

        faction.setName(newName);
        return factionRepository.save(faction);
    });
}`,
      },
      { kind: 'h3', id: 'guide-step-3', text: t('Step 3 — Post a domain event if other modules should react', 'Paso 3 — Publicar un evento de dominio si otros módulos deben reaccionar') },
      {
        kind: 'code',
        lang: 'java',
        code: `eventBus.post(new FactionRenamedDomainEvent(factionId, oldName, newName));`,
      },
      { kind: 'h3', id: 'guide-step-4', text: t('Step 4 — Expose a command', 'Paso 4 — Exponer un comando') },
      {
        kind: 'code',
        lang: 'java',
        code: `public class FactionRenameSubCommand extends SubCommand {

    private final FactionApplicationService factionService;

    @Inject
    public FactionRenameSubCommand(FactionApplicationService factionService) {
        super("rename", "kronos.faction.rename");
        this.factionService = factionService;
    }

    @Override
    public void execute(Player sender, String[] args) {
        factionService.renameFaction(getFactionId(sender), sender.getUniqueId(), args[0]);
    }
}`,
      },
      { kind: 'h3', id: 'guide-step-5', text: t('Step 5 — Register the subcommand via Multibinder', 'Paso 5 — Registrar el subcomando vía Multibinder') },
      {
        kind: 'code',
        lang: 'java',
        code: `Multibinder<SubCommand> factionCommands =
    Multibinder.newSetBinder(binder(), SubCommand.class, Names.named("factionCommands"));
factionCommands.addBinding().to(FactionRenameSubCommand.class);`,
      },
    ],
  };
}
