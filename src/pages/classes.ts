import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildClassesPage(): PageData {
  return {
    route: 'classes',
    module: 'kronos-classes',
    title: 'kronos-classes',
    blocks: [
      { kind: 'h2', id: 'what-are-classes', text: t('What are HCF Classes?', '¿Qué son las Clases HCF?') },
      {
        kind: 'p',
        html: t(
          `HCF classes are cosmetic-armor-triggered combat kits. A player equips a specific helmet, and
          Kronos detects it and applies a passive bonus for as long as it stays equipped. Some classes also
          grant an active ability, gated by a ${ic('CLASS_COOLDOWN')} timer from kronos-timers.`,
          `Las clases HCF son kits de combate activados por armadura cosmética. Un jugador equipa un casco
          específico, y Kronos lo detecta y aplica un bono pasivo mientras permanezca equipado. Algunas clases
          también otorgan una habilidad activa, regulada por un timer ${ic('CLASS_COOLDOWN')} de kronos-timers.`,
        ),
      },

      { kind: 'h2', id: 'kittype-enum', text: t('KitType Enum', 'Enum KitType') },
      { kind: 'chips', items: ['dev.alexissdev.kronos.classes.domain.KitType'] },
      {
        kind: 'table',
        headers: [t('Value', 'Valor'), t('Helmet', 'Casco'), t('Passive', 'Pasiva'), t('Active', 'Activa')],
        rows: [
          ['`ARCHER`', t('Chainmail Helmet', 'Casco de Cota de Malla'), t('Arrows fired deal 20% additional damage', 'Las flechas disparadas hacen 20% de daño adicional'), t('None', 'Ninguna')],
          ['`BARD`', t('Golden Helmet', 'Casco Dorado'), t('Emits a periodic aura granting Speed I to nearby faction members', 'Emite un aura periódica que otorga Velocidad I a los miembros de la facción cercanos'), t('None', 'Ninguna')],
          ['`ROGUE`', t('Leather Helmet', 'Casco de Cuero'), t('Permanent Invisibility while standing still', 'Invisibilidad permanente mientras está quieto'), t('Smoke Bomb — blinds nearby enemies', 'Bomba de Humo — ciega a los enemigos cercanos')],
          ['`MINER`', t('Iron Helmet', 'Casco de Hierro'), t('Haste II while holding a pickaxe', 'Prisa II mientras sostiene un pico'), t('None', 'Ninguna')],
          ['`KNIGHT`', t('Diamond Helmet', 'Casco de Diamante'), t('10% reduced incoming PvE damage', '10% menos de daño PvE recibido'), t('Shield Bash — knocks back nearby enemies', 'Golpe de Escudo — empuja a los enemigos cercanos')],
          ['`DIAMOND`', t('Diamond Helmet (enchanted)', 'Casco de Diamante (encantado)'), t('Immune to fall damage', 'Inmune al daño por caída'), t('Adrenaline Rush — Strength II for 5 seconds', 'Subidón de Adrenalina — Fuerza II durante 5 segundos')],
        ],
      },

      { kind: 'h2', id: 'class-detection', text: t('Class Detection', 'Detección de Clase') },
      {
        kind: 'p',
        html: t(
          `Spigot 1.13.2 predates ${ic('PlayerArmorChangeEvent')}, so ${ic('ClassListener')} instead
          re-checks the player's equipped helmet whenever their inventory could have changed — on
          ${ic('InventoryClickEvent')} and ${ic('PlayerJoinEvent')} — and diffs it against the currently
          applied kit.`,
          `Spigot 1.13.2 es anterior a ${ic('PlayerArmorChangeEvent')}, así que ${ic('ClassListener')} en su lugar
          revisa nuevamente el casco equipado del jugador cada vez que su inventario pudo haber cambiado — en
          ${ic('InventoryClickEvent')} y ${ic('PlayerJoinEvent')} — y lo compara contra el kit actualmente
          aplicado.`,
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `@EventHandler
public void onInventoryClick(InventoryClickEvent event) {
    if (!(event.getWhoClicked() instanceof Player)) return;
    Player player = (Player) event.getWhoClicked();
    Bukkit.getScheduler().runTask(plugin, () -> detectClass(player));
}

private void detectClass(Player player) {
    ItemStack helmet = player.getInventory().getHelmet();
    Optional<KitType> detected = KitType.fromHelmet(helmet);
    Optional<KitType> current = playerService.getPlayer(player.getUniqueId()).getActiveKit();

    if (!detected.equals(current)) {
        current.ifPresent(kit -> kitService.removeEffects(player, kit));
        detected.ifPresent(kit -> kitService.applyEffects(player, kit));
        playerService.setActiveKit(player.getUniqueId(), detected.orElse(null));
    }
}`,
      },

      { kind: 'h2', id: 'applying-removing-effects', text: t('Applying and Removing Effects', 'Aplicar y Remover Efectos') },
      {
        kind: 'p',
        html: t(
          `Passive effects are reapplied continuously rather than granted once, so removing the helmet
          mid-duration cancels the benefit immediately.`,
          `Los efectos pasivos se reaplican continuamente en lugar de otorgarse una sola vez, así que quitarse el
          casco a mitad de la duración cancela el beneficio de inmediato.`,
        ),
      },
      {
        kind: 'ul',
        items: [
          t(
            `${ic('BARD')}: a repeating task runs every 100 ticks (5 seconds) and applies Speed I for 6 seconds
            to every ally faction member within a 10-block radius, as long as the Bard still has the helmet equipped.`,
            `${ic('BARD')}: una tarea repetitiva se ejecuta cada 100 ticks (5 segundos) y aplica Velocidad I durante 6 segundos
            a cada miembro aliado dentro de un radio de 10 bloques, siempre que el Bard siga teniendo el casco equipado.`,
          ),
          t(
            `${ic('KNIGHT')}: the 10% PvE damage reduction is applied inside an ${ic('EntityDamageEvent')}
            listener, which checks the victim's active kit before reducing the final damage value.`,
            `${ic('KNIGHT')}: la reducción del 10% de daño PvE se aplica dentro de un listener de
            ${ic('EntityDamageEvent')}, que verifica el kit activo de la víctima antes de reducir el valor final de daño.`,
          ),
          t(
            `${ic('MINER')}: Haste II is applied and removed from a ${ic('PlayerItemHeldEvent')} listener based
            on whether the newly held item is a pickaxe.`,
            `${ic('MINER')}: Prisa II se aplica y se elimina desde un listener de ${ic('PlayerItemHeldEvent')}
            según si el nuevo ítem sostenido es un pico.`,
          ),
          t(
            `${ic('DIAMOND')}: fall damage is cancelled outright in an ${ic('EntityDamageEvent')} listener when
            the cause is ${ic('FALL')} and the player's active kit is DIAMOND.`,
            `${ic('DIAMOND')}: el daño por caída se cancela directamente en un listener de ${ic('EntityDamageEvent')}
            cuando la causa es ${ic('FALL')} y el kit activo del jugador es DIAMOND.`,
          ),
        ],
      },

      { kind: 'h2', id: 'active-abilities', text: 'Active Abilities and CLASS_COOLDOWN' },
      {
        kind: 'ol',
        items: [
          t(
            'Player left- or right-clicks while their active kit has an associated ability item.',
            'El jugador hace clic izquierdo o derecho mientras su kit activo tiene un ítem de habilidad asociado.',
          ),
          t(
            `${ic('ClassListener')} checks ${ic('TimerApplicationService.hasActiveTimerSync(uuid, CLASS_COOLDOWN)')} from kronos-timers.`,
            `${ic('ClassListener')} verifica ${ic('TimerApplicationService.hasActiveTimerSync(uuid, CLASS_COOLDOWN)')} de kronos-timers.`,
          ),
          t(
            'If the cooldown is active, the interaction is cancelled and the remaining seconds are shown to the player.',
            'Si el cooldown está activo, se cancela la interacción y se muestran al jugador los segundos restantes.',
          ),
          t(
            "Otherwise, the ability's effect executes immediately (e.g. Shield Bash knockback, Smoke Bomb blindness).",
            'De lo contrario, el efecto de la habilidad se ejecuta de inmediato (p. ej. el empuje de Shield Bash, la ceguera de Smoke Bomb).',
          ),
          t(
            `${ic('TimerApplicationService.startTimer(uuid, CLASS_COOLDOWN, cooldownMs)')} is called to begin the cooldown.`,
            `Se llama a ${ic('TimerApplicationService.startTimer(uuid, CLASS_COOLDOWN, cooldownMs)')} para iniciar el cooldown.`,
          ),
          t(
            'The scoreboard shows a live countdown until CLASS_COOLDOWN expires, at which point the ability becomes usable again.',
            'El scoreboard muestra una cuenta regresiva en vivo hasta que CLASS_COOLDOWN expira, momento en el que la habilidad vuelve a estar disponible.',
          ),
        ],
      },

      { kind: 'h2', id: 'services', text: t('KitService Interface', 'Interfaz KitService') },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`applyEffects(player, kitType)`', t("Grants the kit's passive potion effects and starts any recurring tasks it needs", 'Otorga los efectos pasivos del kit e inicia cualquier tarea recurrente que necesite')],
          ['`removeEffects(player, kitType)`', t('Clears the potion effects and cancels any recurring tasks for the kit', 'Elimina los efectos de poción y cancela cualquier tarea recurrente del kit')],
          ['`getActiveKit(uuid)`', t("Returns the player's currently detected kit, if any", 'Devuelve el kit actualmente detectado del jugador, si lo hay')],
          ['`triggerActiveAbility(player)`', t("Executes the active kit's ability if it is not on cooldown", 'Ejecuta la habilidad del kit activo si no está en cooldown')],
          ['`isOnCooldown(uuid)`', t('Checks CLASS_COOLDOWN via TimerService', 'Verifica CLASS_COOLDOWN vía TimerService')],
        ],
      },

      { kind: 'h2', id: 'guide', text: t('Guide: How to Add a New Class', 'Guía: Cómo Agregar una Nueva Clase') },
      { kind: 'h3', id: 'guide-step-1', text: t('Step 1 — Add the enum value and helmet mapping', 'Paso 1 — Agregar el valor del enum y el mapeo de casco') },
      {
        kind: 'code',
        lang: 'java',
        code: `NECROMANCER(Material.WITHER_SKELETON_SKULL);

private final Material helmetMaterial;

KitType(Material helmetMaterial) {
    this.helmetMaterial = helmetMaterial;
}`,
      },
      { kind: 'h3', id: 'guide-step-2', text: t('Step 2 — Implement the passive effect', 'Paso 2 — Implementar el efecto pasivo') },
      {
        kind: 'code',
        lang: 'java',
        code: `if (kitType == KitType.NECROMANCER) {
    player.addPotionEffect(new PotionEffect(PotionEffectType.WITHER, Integer.MAX_VALUE, 0, true, false));
}`,
      },
      { kind: 'h3', id: 'guide-step-3', text: t('Step 3 — Implement the active ability (optional)', 'Paso 3 — Implementar la habilidad activa (opcional)') },
      {
        kind: 'code',
        lang: 'java',
        code: `public void summonSkeletons(Player player) {
    for (int i = 0; i < 2; i++) {
        player.getWorld().spawn(player.getLocation(), Skeleton.class);
    }
}`,
      },
      { kind: 'h3', id: 'guide-step-4', text: t('Step 4 — Register a CLASS_COOLDOWN duration', 'Paso 4 — Registrar una duración de CLASS_COOLDOWN') },
      {
        kind: 'code',
        lang: 'java',
        code: `bind(Long.class)
    .annotatedWith(Names.named("necromancerCooldownMs"))
    .toInstance(config.getLong("classes.necromancer-cooldown-ms", 45_000L));`,
      },
      { kind: 'h3', id: 'guide-step-5', text: t('Step 5 — Add the /class selection command', 'Paso 5 — Agregar el comando de selección /class') },
      {
        kind: 'code',
        lang: 'java',
        code: `classCommands.addBinding().to(ClassSelectSubCommand.class);
// usage: /class necromancer`,
      },
      { kind: 'h3', id: 'guide-step-6', text: t('Step 6 — Document the kit in the shop config', 'Paso 6 — Documentar el kit en la configuración de la tienda') },
      {
        kind: 'code',
        lang: 'text',
        code: `classes:
  necromancer:
    helmet: WITHER_SKELETON_SKULL
    price: 15000.0
    cooldown-ms: 45000`,
      },
    ],
  };
}
