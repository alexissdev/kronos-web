import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildClaimsPage(): PageData {
  return {
    route: 'claims',
    module: 'kronos-claims',
    title: 'kronos-claims',
    blocks: [
      { kind: 'h2', id: 'overview', text: t('Overview', 'Resumen') },
      {
        kind: 'p',
        html: t(
          `The claims system is a chunk-based territory manager. Every chunk on the server maps to exactly
          one ${ic('Claim')} — either the implicit wilderness claim or an explicit claim owned by a faction or
          the server itself (SafeZone, WarZone, KOTH, admin land).`,
          `El sistema de claims es un gestor de territorio basado en chunks. Cada chunk del servidor corresponde exactamente
          a un ${ic('Claim')} — ya sea el claim implícito de wilderness o un claim explícito perteneciente a una facción o
          al propio servidor (SafeZone, WarZone, KOTH, terreno de admins).`,
        ),
      },

      { kind: 'h2', id: 'domain-model', text: t('Domain Model — Claim', 'Modelo de Dominio — Claim') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.claims.domain.Claim'] },
      {
        kind: 'table',
        headers: [t('Field', 'Campo'), t('Type', 'Tipo'), t('Description', 'Descripción')],
        rows: [
          ['`id`', '`String`', t('Immutable UUID-as-string assigned at creation', 'UUID inmutable como string, asignado en la creación')],
          ['`type`', '`ClaimType`', t('Governs PvP and build-protection rules for the claim', 'Rige las reglas de PvP y protección de construcción del claim')],
          ['`ownerFactionId`', '`Optional<String>`', t('Present only when type is FACTION', 'Presente solo cuando type es FACTION')],
          ['`chunks`', '`Set<ChunkPosition>`', t('All chunk coordinates covered by this claim', 'Todas las coordenadas de chunk cubiertas por este claim')],
          ['`world`', '`String`', t('World name the claim belongs to', 'Nombre del mundo al que pertenece el claim')],
          ['`createdAt`', '`Instant`', t('UTC creation timestamp', 'Marca de tiempo UTC de creación')],
        ],
      },
      { kind: 'h3', id: 'claim-key-methods', text: t('Key Methods', 'Métodos Clave') },
      {
        kind: 'code',
        lang: 'java',
        code: `boolean containsChunk(ChunkPosition chunk)   // true if chunks contains the given coordinate
int     getChunkCount()                      // chunks.size()`,
      },

      { kind: 'h2', id: 'claimtype-enum', text: t('ClaimType Enum', 'Enum ClaimType') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.claims.domain.ClaimType'] },
      {
        kind: 'table',
        headers: [t('Value', 'Valor'), t('System Claim', 'Claim de Sistema'), t('PvP Allowed', 'PvP Permitido'), t('Build Protected', 'Protegido de Construcción'), t('Description', 'Descripción')],
        rows: [
          ['`WILDERNESS`', t('yes', 'sí'), t('yes', 'sí'), t('no', 'no'), t('The implicit default for any unclaimed chunk', 'El valor implícito por defecto para cualquier chunk sin reclamar')],
          ['`SAFE_ZONE`', t('yes', 'sí'), t('no', 'no'), t('yes', 'sí'), t('Server-defined no-PvP area, usually around spawn towns', 'Área sin PvP definida por el servidor, usualmente alrededor de las ciudades de spawn')],
          ['`WAR_ZONE`', t('yes', 'sí'), t('yes', 'sí'), t('no', 'no'), t('Server-defined open-PvP area with no build protection', 'Área de PvP abierto definida por el servidor sin protección de construcción')],
          ['`KOTH`', t('yes', 'sí'), t('yes', 'sí'), t('yes', 'sí'), t('Auto-created by kronos-koth for the duration of an active event', 'Creado automáticamente por kronos-koth durante la duración de un evento activo')],
          ['`FACTION`', t('no', 'no'), t('yes', 'sí'), t('yes', 'sí'), t("A faction's owned territory; PvP is gated by ally/enemy relation, not by claim type", 'Territorio propiedad de una facción; el PvP se rige por la relación de aliado/enemigo, no por el tipo de claim')],
          ['`ADMIN_CLAIM`', t('yes', 'sí'), t('no', 'no'), t('yes', 'sí'), t('Manually protected land for builds, shops, or NPCs', 'Terreno protegido manualmente para construcciones, tiendas o NPCs')],
          ['`EVENT_ZONE`', t('yes', 'sí'), t('yes', 'sí'), t('yes', 'sí'), t('Temporary claim created for server events other than KOTH', 'Claim temporal creado para eventos del servidor distintos de KOTH')],
        ],
      },

      { kind: 'h2', id: 'helper-predicates', text: t('Helper Predicates', 'Predicados Auxiliares') },
      {
        kind: 'p',
        html: t(
          'ClaimType exposes three predicate methods so callers never need to switch on the enum directly.',
          'ClaimType expone tres métodos predicado para que quien lo use nunca necesite hacer switch directamente sobre el enum.',
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `boolean isSystemClaim()        // true for every value except FACTION
boolean allowsPvp()             // baseline PvP rule before faction-relation overrides apply
boolean isProtectedFromBuild()  // true if non-owners cannot break or place blocks`,
      },

      { kind: 'h2', id: 'territory-operations', text: t('Territory Operations', 'Operaciones de Territorio') },
      { kind: 'h3', id: 'claiming', text: t('Claiming', 'Reclamar (Claiming)') },
      {
        kind: 'ol',
        items: [
          t('Actor must hold CAPTAIN role or higher in their faction.', 'El actor debe tener el rol CAPTAIN o superior en su facción.'),
          t(
            `Target chunk must currently be ${ic('WILDERNESS')} (checked via ${ic('ClaimRepository.findByChunk')}).`,
            `El chunk objetivo debe ser actualmente ${ic('WILDERNESS')} (verificado vía ${ic('ClaimRepository.findByChunk')}).`,
          ),
          t(
            'Target chunk must be adjacent to a chunk already owned by the same faction, unless this is the very first claim.',
            'El chunk objetivo debe ser adyacente a un chunk ya propiedad de la misma facción, salvo que sea el primer claim.',
          ),
          t("Faction's claim count must be below the configured per-faction chunk limit.", 'El conteo de claims de la facción debe estar por debajo del límite de chunks configurado por facción.'),
          t(
            'A new or extended Claim is persisted and the chunk is added to the in-memory claim index.',
            'Se persiste un Claim nuevo o extendido y el chunk se agrega al índice de claims en memoria.',
          ),
          t('`EventBus.post(new FactionClaimedDomainEvent(factionId, chunk))` is posted.', 'Se publica `EventBus.post(new FactionClaimedDomainEvent(factionId, chunk))`.'),
        ],
      },
      { kind: 'h3', id: 'unclaiming', text: t('Unclaiming', 'Liberar Territorio (Unclaiming)') },
      {
        kind: 'ol',
        items: [
          t('Actor must hold CAPTAIN role or higher in the owning faction.', 'El actor debe tener el rol CAPTAIN o superior en la facción propietaria.'),
          t(
            'Chunk is removed from the Claim; if the Claim has zero chunks remaining it is deleted entirely.',
            'El chunk se elimina del Claim; si el Claim queda con cero chunks, se elimina por completo.',
          ),
          t('The in-memory claim index entry for that chunk is invalidated.', 'Se invalida la entrada del índice de claims en memoria para ese chunk.'),
          t('`EventBus.post(new FactionUnclaimedDomainEvent(factionId, chunk))` is posted.', 'Se publica `EventBus.post(new FactionUnclaimedDomainEvent(factionId, chunk))`.'),
        ],
      },
      { kind: 'h3', id: 'unclaim-all', text: t('Unclaiming All (on Disband)', 'Liberar Todo el Territorio (al Disolverse)') },
      {
        kind: 'ol',
        items: [
          t('`FactionDisbandedDomainEvent` is received by `ClaimListener`.', '`ClaimListener` recibe el evento `FactionDisbandedDomainEvent`.'),
          t('`ClaimApplicationService.unclaimAll(factionId)` loads every Claim owned by the faction.', '`ClaimApplicationService.unclaimAll(factionId)` carga todos los Claims propiedad de la facción.'),
          t('All chunks are released back to `WILDERNESS` in a single batched Mongo write.', 'Todos los chunks se liberan de vuelta a `WILDERNESS` en una única escritura por lotes en Mongo.'),
          t('The in-memory claim index removes every chunk previously mapped to the faction.', 'El índice de claims en memoria elimina todos los chunks previamente asociados a la facción.'),
        ],
      },
      { kind: 'h3', id: 'overclaiming', text: t('Overclaiming', 'Overclaiming') },
      {
        kind: 'ol',
        items: [
          t(
            'Target faction must have `raidable == true` (set once DTK reaches zero — see kronos-factions).',
            'La facción objetivo debe tener `raidable == true` (se establece cuando el DTK llega a cero — ver kronos-factions).',
          ),
          t('Actor must be a CAPTAIN+ member of an enemy faction of the target.', 'El actor debe ser miembro CAPTAIN o superior de una facción enemiga de la objetivo.'),
          t('The same adjacency rule as normal claiming applies to the claiming faction.', 'Se aplica la misma regla de adyacencia del claiming normal a la facción que reclama.'),
          t(
            "The target chunk is removed from the raided faction's Claim and added to the claiming faction's Claim in one transaction-like sequence.",
            'El chunk objetivo se elimina del Claim de la facción raideada y se agrega al Claim de la facción que reclama, en una secuencia similar a una transacción.',
          ),
          t(
            '`EventBus.post(new FactionClaimedDomainEvent(claimingFactionId, chunk))` and `FactionUnclaimedDomainEvent(raidedFactionId, chunk)` are both posted.',
            'Se publican tanto `EventBus.post(new FactionClaimedDomainEvent(claimingFactionId, chunk))` como `FactionUnclaimedDomainEvent(raidedFactionId, chunk)`.',
          ),
        ],
      },

      { kind: 'h2', id: 'conflict-detection', text: t('Conflict Detection', 'Detección de Conflictos') },
      {
        kind: 'p',
        html: t(
          `Before any claim mutation is committed, ${ic('ClaimApplicationService')} runs two independent checks
          concurrently and combines them with ${ic('CompletableFuture.allOf')} so neither check blocks the other.`,
          `Antes de confirmar cualquier mutación de claim, ${ic('ClaimApplicationService')} ejecuta dos verificaciones independientes
          de forma concurrente y las combina con ${ic('CompletableFuture.allOf')} para que ninguna bloquee a la otra.`,
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `CompletableFuture<Boolean> alreadyClaimed = claimRepository.findByChunk(chunk)
    .thenApply(Optional::isPresent);

CompletableFuture<Boolean> isAdjacent = claimRepository.findByFaction(factionId)
    .thenApply(claims -> claims.stream()
        .flatMap(claim -> claim.getChunks().stream())
        .anyMatch(owned -> owned.isAdjacentTo(chunk)));

return CompletableFuture.allOf(alreadyClaimed, isAdjacent).thenApply(v -> {
    if (alreadyClaimed.join()) throw new ChunkAlreadyClaimedException(chunk);
    if (!isAdjacent.join())   throw new ChunkNotAdjacentException(chunk);
    return true;
});`,
      },

      { kind: 'h2', id: 'factions-integration', text: t('Integration with Factions', 'Integración con Factions') },
      {
        kind: 'p',
        html: t(
          `The coupling between the two modules is unidirectional: ${ic('kronos-claims')} depends on
          ${ic('kronos-factions')} to resolve faction membership, roles, and raidable state, but
          ${ic('kronos-factions')} never references anything in ${ic('kronos-claims')}. All communication
          that flows the other way happens exclusively through domain events.`,
          `El acoplamiento entre ambos módulos es unidireccional: ${ic('kronos-claims')} depende de
          ${ic('kronos-factions')} para resolver membresía, roles y estado raideable, pero
          ${ic('kronos-factions')} nunca referencia nada de ${ic('kronos-claims')}. Toda la comunicación
          que fluye en la otra dirección ocurre exclusivamente mediante eventos de dominio.`,
        ),
      },
      {
        kind: 'table',
        headers: [t('Event Consumed', 'Evento Consumido'), t('Source Module', 'Módulo de Origen'), t('Effect in kronos-claims', 'Efecto en kronos-claims')],
        rows: [
          ['`FactionRaidableDomainEvent`', 'kronos-factions', t('Marks the faction eligible for overclaiming', 'Marca a la facción como elegible para overclaiming')],
          ['`FactionDisbandedDomainEvent`', 'kronos-factions', t('Triggers `unclaimAll(factionId)`', 'Dispara `unclaimAll(factionId)`')],
        ],
      },

      { kind: 'h2', id: 'services', text: t('ClaimService Interface', 'Interfaz ClaimService') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`claimChunk(factionId, actorUuid, chunk)`', t('Claims a wilderness chunk adjacent to existing territory', 'Reclama un chunk de wilderness adyacente al territorio existente')],
          ['`unclaimChunk(factionId, actorUuid, chunk)`', t('Releases a chunk back to WILDERNESS', 'Libera un chunk de vuelta a WILDERNESS')],
          ['`unclaimAll(factionId)`', t('Releases every chunk owned by a faction, used on disband', 'Libera todos los chunks propiedad de una facción, usado al disolverse')],
          ['`overclaimChunk(claimingFactionId, actorUuid, chunk)`', t('Transfers a chunk from a raidable faction to the claiming faction', 'Transfiere un chunk de una facción raideable a la facción que reclama')],
          ['`getClaimAt(chunk)`', t('Returns the Claim covering a chunk, or the implicit WILDERNESS claim', 'Devuelve el Claim que cubre un chunk, o el claim implícito WILDERNESS')],
          ['`getClaimsByFaction(factionId)`', t('Returns every Claim owned by a faction', 'Devuelve todos los Claims propiedad de una facción')],
          ['`isClaimed(chunk)`', t('True if the chunk belongs to any non-WILDERNESS claim', 'True si el chunk pertenece a algún claim que no sea WILDERNESS')],
        ],
      },

      { kind: 'h2', id: 'exceptions', text: t('Exceptions', 'Excepciones') },
      {
        kind: 'table',
        headers: [t('Class', 'Clase'), t('Extends', 'Extiende'), t('When Thrown', 'Cuándo se Lanza')],
        rows: [
          ['`ChunkAlreadyClaimedException`', '`KronosException`', t('The target chunk already belongs to a non-WILDERNESS claim', 'El chunk objetivo ya pertenece a un claim que no es WILDERNESS')],
          ['`ChunkNotAdjacentException`', '`KronosException`', t("The target chunk does not border the faction's existing territory", 'El chunk objetivo no colinda con el territorio existente de la facción')],
          ['`FactionNotRaidableException`', '`KronosException`', t('An overclaim is attempted on a faction with raidable == false', 'Se intenta un overclaim sobre una facción con raidable == false')],
          ['`ClaimLimitReachedException`', '`KronosException`', t("The faction's chunk count is already at the configured maximum", 'El conteo de chunks de la facción ya está en el máximo configurado')],
          ['`NotClaimOwnerException`', '`KronosException`', t('The actor is not a CAPTAIN+ member of the claim-owning faction', 'El actor no es miembro CAPTAIN o superior de la facción propietaria del claim')],
        ],
      },
    ],
  };
}
