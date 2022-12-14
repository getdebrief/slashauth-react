import { InjectedConnector, Provider, connect, disconnect } from '@wagmi/core';
import {
  Client,
  createClient,
  ChainProviderFn,
  configureChains,
  Connector,
} from 'wagmi';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { infuraProvider } from '@wagmi/core/providers/infura';
import { publicProvider } from '@wagmi/core/providers/public';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { Signer } from 'ethers';
import { mainnet, goerli } from 'wagmi/chains';
import { WagmiOptions } from '../../types/slashauth';

export type Web3ManagerEventType =
  | 'accountChange'
  | 'chainChange'
  | 'connect'
  | 'disconnect';

type Config = {
  appName: string;
  wagmiOptions?: WagmiOptions;
  alchemy?: {
    apiKey: string;
  };
  infura?: {
    apiKey: string;
  };
  publicConf?: {
    disable: boolean;
  };
};

const defaultChains = [mainnet, goerli];

type WagmiClient = Client;

type AccountChangeListener = (account: string) => void;
type ChainChangeListener = (
  chain: number | string,
  unsupported: boolean
) => void;
type ConnectListener = (connector: Connector) => void;
type DisconnectListener = () => void;

type EventListener = (
  eventType: Web3ManagerEventType,
  mgr: Web3Manager
) => void;

export class Web3Manager {
  #connected: boolean;
  #provider: Provider | undefined;
  #signer: Signer | undefined;
  #address: string | undefined;

  #connectors: Connector[];

  #client: WagmiClient;
  #config: Config;

  #accountChangeListeners: AccountChangeListener[] = [];
  #chainChangeListeners: ChainChangeListener[] = [];
  #connectListeners: ConnectListener[] = [];
  #disconnectListeners: DisconnectListener[] = [];
  #eventListeners: EventListener[] = [];

  get client(): ReturnType<typeof createClient> {
    return this.#client as ReturnType<typeof createClient>;
  }

  get connected(): boolean {
    return this.#connected;
  }

  get provider(): Provider | undefined {
    return this.#provider;
  }

  get signer(): Signer | undefined {
    return this.#signer;
  }

  get address(): string | undefined {
    return this.#address;
  }

  get connectedConnector(): Connector | null {
    return this.#client.connector;
  }

  get connectors(): Connector[] {
    return this.#connectors;
  }

  private unsubscribeFns: (() => void)[] = [];

  constructor(config: Config) {
    this.#config = config;

    this.#createClient(true);
    this.#attachClientListeners();
  }

  public async clearState() {
    return disconnect();
  }

  public onEvent(listener: EventListener) {
    this.#eventListeners.push(listener);
  }

  public offEvent(listener: EventListener) {
    this.#eventListeners = this.#eventListeners.filter((l) => l !== listener);
  }

  public onConnect(listener: ConnectListener) {
    this.#connectListeners.push(listener);
  }

  public offConnect(listener: ConnectListener) {
    this.#connectListeners = this.#connectListeners.filter(
      (l) => l !== listener
    );
  }

  public onAccountChange(listener: AccountChangeListener) {
    this.#accountChangeListeners.push(listener);
  }

  public offAccountChange(listener: AccountChangeListener) {
    this.#accountChangeListeners = this.#accountChangeListeners.filter(
      (l) => l !== listener
    );
  }

  public onChainChange(listener: ChainChangeListener) {
    this.#chainChangeListeners.push(listener);
  }

  public offChainChange(listener: ChainChangeListener) {
    this.#chainChangeListeners = this.#chainChangeListeners.filter(
      (l) => l !== listener
    );
  }

  public onDisconnect(listener: DisconnectListener) {
    this.#disconnectListeners.push(listener);
  }

  public offDisconnect(listener: DisconnectListener) {
    this.#disconnectListeners = this.#disconnectListeners.filter(
      (l) => l !== listener
    );
  }

  public async disconnect(): Promise<void> {
    await disconnect();
  }

  public async autoConnect(): Promise<string | null> {
    await this.#client.autoConnect();
    const account = await this.connectedConnector?.getAccount();
    return account || null;
  }

  public async connectToConnectorWithID(id: string) {
    const connector = this.#connectors.find((c) => c.id === id);
    if (connector) {
      await this.connectToConnector(connector);
    }
  }

  public async connectToConnector(connector: Connector) {
    if (this.#client.status === 'connected') {
      if (this.#client.connector?.id === connector.id) {
        return Promise.resolve();
      } else {
        // We have to disconnect and then connect to the connector.
        await this.disconnect();
      }
    }

    await connect({
      chainId: this.#client.lastUsedChainId,
      connector,
    });

    if (this.#client.status === 'connected') {
      this.#onConnectorConnect();
    }
  }

  #createClient(autoConnect: boolean) {
    const providers: ChainProviderFn[] = [];
    const { alchemy, infura, publicConf, appName } = this.#config;
    const configPassedIn =
      !!alchemy ||
      !!infura ||
      !!publicConf ||
      !!appName ||
      !!this.#config.wagmiOptions?.enabledChains ||
      !!this.#config.wagmiOptions?.pollingIntervalMs;
    if (alchemy) {
      providers.push(alchemyProvider(alchemy));
    }
    if (infura) {
      providers.push(infuraProvider(infura));
    }
    if (!publicConf?.disable) {
      providers.push(publicProvider());
    }

    const { chains, provider, webSocketProvider } = configureChains(
      this.#config.wagmiOptions?.enabledChains || defaultChains,
      providers,
      {
        pollingInterval: this.#config.wagmiOptions?.pollingIntervalMs || 30_000,
      }
    );

    this.#connectors = [
      new MetaMaskConnector({ chains }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
        },
      }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName,
        },
      }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      }),
    ];

    if (this.#config.wagmiOptions?.wagmiClient) {
      // The user has passed in a client. We should warn if they have other
      // options defined.
      if (configPassedIn) {
        console.warn(
          'Wagmi client was passed to SlashAuthProvider as well as other configuration options. The client passed in will be used and other options are ignored.'
        );
      }
      this.#client = this.#config.wagmiOptions.wagmiClient as WagmiClient;

      // Show our four default connectors if only an injected connector is passed in
      // (this is wagmi's default when no connectors are passed into the wagmi client)
      if (
        this.#client.connectors.length !== 0 &&
        (this.#client.connectors.length !== 1 ||
          this.#client.connectors[0].id !== 'injected')
      ) {
        this.#connectors = this.#client.connectors;
      }
    } else {
      this.#client = createClient({
        autoConnect,
        connectors: this.#connectors,
        provider,
        webSocketProvider,
      }) as WagmiClient;
    }
  }

  #onConnectorConnect = async () => {
    this.connectedConnector.on('change', async (state) => {
      if (state.account && this.connectedConnector) {
        this.#address = await this.connectedConnector.getAccount();
        this.#signer = await this.connectedConnector.getSigner();
        this.#provider = await this.connectedConnector.getProvider();
        this.#connected = true;
        this.#accountChangeListeners.forEach((l) => l(state.account));
        this.#eventListeners.forEach((l) => l('accountChange', this));
      }
      if (state.chain) {
        this.#chainChangeListeners.forEach((l) =>
          l(state.chain.id, state.chain.unsupported)
        );
        this.#eventListeners.forEach((l) => l('chainChange', this));
      }
    });

    this.connectedConnector.on('disconnect', () => {
      this.#address = undefined;
      this.#signer = undefined;
      this.#provider = undefined;
      this.#connected = false;
      this.#disconnectListeners.forEach((l) => l());
      this.#eventListeners.forEach((l) => l('disconnect', this));
    });

    this.connectedConnector.on('message', (message) => {
      // Connect this for messages
    });

    this.#address = await this.connectedConnector.getAccount();
    this.#signer = await this.connectedConnector.getSigner();
    this.#provider = await this.connectedConnector.getProvider();
    this.#connected = true;

    this.#connectListeners.forEach((l) => l(this.connectedConnector));
    this.#eventListeners.forEach((l) => l('connect', this));
  };

  #attachClientListeners() {
    const unsubscribe = this.#client.subscribe(
      ({ data, status, connector }) => ({
        address: data?.account,
        status,
        connector,
      }),
      (state, prevState) => {
        if (
          state.address !== prevState.address &&
          state.status === 'connected'
        ) {
          this.#onConnectorConnect();
        } else if (state.status !== prevState.status) {
          if (state.status === 'connected') {
            this.#onConnectorConnect();
          } else if (
            state.status === 'disconnected' &&
            prevState.status !== 'disconnected' &&
            !!prevState.connector
          ) {
            this.#disconnectListeners.forEach((l) => l());
            this.#onConnectorDisconnect(prevState.connector);
          }
        }
      },
      {
        equalityFn: (a, b) => a.address === b.address && a.status === b.status,
        fireImmediately: true,
      }
    );

    const connectorListenUnsubscribe = this.#client.subscribe(
      ({ connector }) => ({
        connector,
      }),
      (state, prevState) => {
        if (
          state.connector &&
          state.connector?.id !== prevState.connector?.id &&
          // This fires twice sometimes.
          this.connectedConnector?.id !== state.connector?.id
        ) {
          this.#onConnectorConnect();
        }
      },
      {
        equalityFn: (a, b) => a.connector?.id === b.connector?.id,
        fireImmediately: true,
      }
    );

    this.unsubscribeFns.push(unsubscribe);
    this.unsubscribeFns.push(connectorListenUnsubscribe);
  }

  #onConnectorDisconnect = (connector: Connector) => {
    connector.off('change');
    connector.off('disconnect');
    connector.off('message');
  };
}
