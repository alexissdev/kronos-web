import type { PageData } from '../types.ts';
import { ic, t } from './util.ts';

export function buildEconomyPage(): PageData {
  return {
    route: 'economy',
    module: 'kronos-economy',
    title: 'kronos-economy',
    blocks: [
      { kind: 'h2', id: 'vault-abstraction', text: t('Vault Abstraction', 'Abstracción de Vault') },
      {
        kind: 'p',
        html: t(
          `kronos-economy wraps whatever Vault-compatible economy plugin is installed on the server behind
          a single async ${ic('EconomyService')} interface. No other module ever touches Vault's ${ic('Economy')}
          class directly — they depend only on ${ic('EconomyService')}, so the underlying economy plugin can be
          swapped without touching any calling code.`,
          `kronos-economy envuelve cualquier plugin de economía compatible con Vault instalado en el servidor detrás
          de una única interfaz async ${ic('EconomyService')}. Ningún otro módulo toca directamente la clase
          ${ic('Economy')} de Vault — dependen solo de ${ic('EconomyService')}, de modo que el plugin de economía
          subyacente puede reemplazarse sin tocar ningún código que lo invoque.`,
        ),
      },

      { kind: 'h2', id: 'services', text: 'EconomyService Interface' },
      { kind: 'chips', items: ['dev.alexissdev.kronos.economy.EconomyService'] },
      {
        kind: 'table',
        headers: [t('Method', 'Método'), t('Description', 'Descripción')],
        rows: [
          ['`CompletableFuture<Double> getBalance(UUID uuid)`', t("Reads the player's current Vault balance", 'Lee el saldo actual de Vault del jugador')],
          ['`CompletableFuture<Void> deposit(UUID uuid, double amount)`', t("Adds funds to the player's Vault balance", 'Agrega fondos al saldo de Vault del jugador')],
          ['`CompletableFuture<Void> withdraw(UUID uuid, double amount)`', t("Removes funds from the player's Vault balance", 'Retira fondos del saldo de Vault del jugador')],
          ['`CompletableFuture<Void> transfer(UUID from, UUID to, double amount)`', t('Withdraws from one player and deposits to another', 'Retira de un jugador y deposita a otro')],
          ['`CompletableFuture<Boolean> hasEnoughBalance(UUID uuid, double amount)`', t('True if the balance is greater than or equal to amount', 'True si el saldo es mayor o igual al monto')],
        ],
      },

      { kind: 'h2', id: 'main-thread-executor', text: t('Main-Thread Executor Strategy', 'Estrategia del Executor de Hilo Principal') },
      {
        kind: 'p',
        html: t(
          `Vault's ${ic('Economy')} API is synchronous and must be called from the Bukkit main thread — Vault
          itself does no thread-safety enforcement, and most economy plugin backends assume main-thread access.
          Every ${ic('EconomyService')} method internally schedules its Vault call onto the main thread via a
          dedicated executor and returns a ${ic('CompletableFuture')} that completes once the result is available.`,
          `La API ${ic('Economy')} de Vault es síncrona y debe llamarse desde el hilo principal de Bukkit — Vault
          en sí no impone seguridad entre hilos, y la mayoría de los backends de plugins de economía asumen acceso
          desde el hilo principal. Cada método de ${ic('EconomyService')} programa internamente su llamada a Vault
          en el hilo principal mediante un executor dedicado y devuelve un ${ic('CompletableFuture')} que se
          completa cuando el resultado está disponible.`,
        ),
      },
      {
        kind: 'code',
        lang: 'java',
        code: `public class MainThreadExecutor implements Executor {

    private final Plugin plugin;

    @Inject
    public MainThreadExecutor(Plugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public void execute(Runnable command) {
        if (Bukkit.isPrimaryThread()) {
            command.run();
        } else {
            Bukkit.getScheduler().runTask(plugin, command);
        }
    }
}`,
      },

      { kind: 'h2', id: 'vaulteconomyservice-impl', text: 'VaultEconomyService Implementation' },
      {
        kind: 'code',
        lang: 'java',
        code: `public class VaultEconomyService implements EconomyService {

    private final Economy vaultEconomy;
    private final Executor mainThreadExecutor;

    @Inject
    public VaultEconomyService(Economy vaultEconomy,
                                @MainThread Executor mainThreadExecutor) {
        this.vaultEconomy = vaultEconomy;
        this.mainThreadExecutor = mainThreadExecutor;
    }

    @Override
    public CompletableFuture<Double> getBalance(UUID uuid) {
        return CompletableFuture.supplyAsync(
            () -> vaultEconomy.getBalance(Bukkit.getOfflinePlayer(uuid)),
            mainThreadExecutor);
    }

    @Override
    public CompletableFuture<Void> deposit(UUID uuid, double amount) {
        return CompletableFuture.runAsync(
            () -> vaultEconomy.depositPlayer(Bukkit.getOfflinePlayer(uuid), amount),
            mainThreadExecutor);
    }

    @Override
    public CompletableFuture<Void> withdraw(UUID uuid, double amount) {
        return hasEnoughBalance(uuid, amount).thenComposeAsync(hasEnough -> {
            if (!hasEnough) {
                throw new InsufficientFundsException(uuid, amount);
            }
            return CompletableFuture.runAsync(
                () -> vaultEconomy.withdrawPlayer(Bukkit.getOfflinePlayer(uuid), amount),
                mainThreadExecutor);
        }, mainThreadExecutor);
    }

    @Override
    public CompletableFuture<Void> transfer(UUID from, UUID to, double amount) {
        return withdraw(from, amount).thenCompose(v -> deposit(to, amount));
    }

    @Override
    public CompletableFuture<Boolean> hasEnoughBalance(UUID uuid, double amount) {
        return getBalance(uuid).thenApply(balance -> balance >= amount);
    }
}`,
      },

      { kind: 'h2', id: 'moneycommand-subcommands', text: t('MoneyCommand Subcommands', 'Subcomandos de MoneyCommand') },
      {
        kind: 'table',
        headers: [t('Subcommand', 'Subcomando'), t('Permission', 'Permiso'), t('Description', 'Descripción')],
        rows: [
          ['`/money` or `/money balance`', t('none', 'ninguno'), t("Shows the sender's own balance", 'Muestra el saldo propio de quien ejecuta el comando')],
          ['`/money balance <player>`', '`kronos.money.others`', t("Shows another player's balance", 'Muestra el saldo de otro jugador')],
          ['`/money pay <player> <amount>`', t('none', 'ninguno'), t('Transfers funds from the sender to another player', 'Transfiere fondos de quien ejecuta el comando a otro jugador')],
          ['`/money set <player> <amount>`', '`kronos.money.admin`', t("Sets a player's balance directly", 'Establece el saldo de un jugador directamente')],
          ['`/money give <player> <amount>`', '`kronos.money.admin`', t("Deposits funds into a player's balance", 'Deposita fondos en el saldo de un jugador')],
          ['`/money take <player> <amount>`', '`kronos.money.admin`', t("Withdraws funds from a player's balance", 'Retira fondos del saldo de un jugador')],
        ],
      },

      { kind: 'h2', id: 'guice-module', text: t('Guice Module', 'Módulo de Guice') },
      {
        kind: 'code',
        lang: 'java',
        code: `public class EconomyModule extends AbstractModule {

    private final Plugin plugin;

    public EconomyModule(Plugin plugin) {
        this.plugin = plugin;
    }

    @Override
    protected void configure() {
        RegisteredServiceProvider<Economy> provider =
            Bukkit.getServicesManager().getRegistration(Economy.class);
        if (provider == null) {
            throw new IllegalStateException("Vault economy provider not found");
        }

        bind(Economy.class).toInstance(provider.getProvider());
        bind(Executor.class).annotatedWith(MainThread.class).to(MainThreadExecutor.class).in(Singleton.class);
        bind(EconomyService.class).to(VaultEconomyService.class).in(Singleton.class);
    }
}`,
      },

      { kind: 'h2', id: 'insufficientfundsexception', text: 'InsufficientFundsException' },
      {
        kind: 'p',
        html: t(
          'Thrown by `withdraw` and any operation composed from it (such as `transfer`) when the balance check fails.',
          'Se lanza desde `withdraw` y cualquier operación compuesta a partir de él (como `transfer`) cuando falla la verificación de saldo.',
        ),
      },
      {
        kind: 'code',
        lang: 'text',
        code: `InsufficientFundsException: player a1b2c3d4-... has 240.00 but attempted to withdraw 500.00`,
      },
    ],
  };
}
