import {
  InjectedConnector,
  Provider,
  ConnectArgs,
  ConnectResult,
} from '@wagmi/core';
import {
  Client,
  createClient,
  ChainProviderFn,
  configureChains,
  Connector,
  defaultChains,
} from 'wagmi';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { infuraProvider } from '@wagmi/core/providers/infura';
import { publicProvider } from '@wagmi/core/providers/public';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { Signer } from 'ethers';

export type Web3ManagerEventType =
  | 'accountChange'
  | 'chainChange'
  | 'connect'
  | 'disconnect';

type Config = {
  appName: string;
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

type ConnectFunction = (
  args?: Partial<ConnectArgs> | undefined
) => Promise<ConnectResult<Provider> | null>;

type DisconnectFunction = () => Promise<void>;

type SetClientFunctionsArgs = {
  connect: ConnectFunction;
  disconnect: DisconnectFunction;
};

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

  #connectFn: ConnectFunction = () => null;
  #disconnectFn: DisconnectFunction = () => null;

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

  public setClientFunctions({ connect, disconnect }: SetClientFunctionsArgs) {
    this.#connectFn = connect;
    this.#disconnectFn = disconnect;
  }

  public async clearState() {
    return this.#disconnectFn();
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
    await this.#disconnectFn();
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

    await this.#connectFn({
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
      defaultChains,
      providers,
      { pollingInterval: 30_000 }
    );

    this.#connectors = [
      new MetaMaskConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName,
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
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

    this.#client = createClient({
      autoConnect: false,
      connectors: this.#connectors,
      provider,
      webSocketProvider,
    }) as WagmiClient;
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
