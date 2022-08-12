import {
  ChainProviderFn,
  Client,
  configureChains,
  Connector,
  createClient,
  defaultChains,
  InjectedConnector,
} from '@wagmi/core';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { infuraProvider } from '@wagmi/core/providers/infura';
import { publicProvider } from '@wagmi/core/providers/public';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';

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

export class WagmiConnector {
  connectors: Connector[];
  private client: WagmiClient;

  private config: Config;

  private accountChangeListeners: AccountChangeListener[] = [];
  private chainChangeListeners: ChainChangeListener[] = [];
  private connectListeners: ConnectListener[] = [];
  private disconnectListeners: DisconnectListener[] = [];

  get connectedConnector(): Connector | null {
    return this.client.connector;
  }

  get lastUsedChainId() {
    return this.client.lastUsedChainId;
  }

  private unsubscribeFns: (() => void)[] = [];

  constructor(config: Config) {
    this.config = config;

    this.createClient();
    this.attachClientListeners();
  }

  public async clearState() {
    await this.connectedConnector?.disconnect();
    this.client.setLastUsedConnector(null);
    this.client.destroy();
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
    this.createClient();
    this.attachClientListeners();
  }

  public onConnect(listener: ConnectListener) {
    this.connectListeners.push(listener);
  }

  public offConnect(listener: ConnectListener) {
    this.connectListeners = this.connectListeners.filter((l) => l !== listener);
  }

  public onAccountChange(listener: AccountChangeListener) {
    this.accountChangeListeners.push(listener);
  }

  public offAccountChange(listener: AccountChangeListener) {
    this.accountChangeListeners = this.accountChangeListeners.filter(
      (l) => l !== listener
    );
  }

  public onChainChange(listener: ChainChangeListener) {
    this.chainChangeListeners.push(listener);
  }

  public offChainChange(listener: ChainChangeListener) {
    this.chainChangeListeners = this.chainChangeListeners.filter(
      (l) => l !== listener
    );
  }

  public onDisconnect(listener: DisconnectListener) {
    this.disconnectListeners.push(listener);
  }

  public offDisconnect(listener: DisconnectListener) {
    this.disconnectListeners = this.disconnectListeners.filter(
      (l) => l !== listener
    );
  }

  public async autoConnect(): Promise<string | null> {
    await this.client.autoConnect();
    const account = await this.connectedConnector?.getAccount();
    return account || null;
  }

  public async connectToConnector(connector: Connector) {
    this.client.setLastUsedConnector(connector.id);
    await this.client.autoConnect();
    if (this.client.status === 'connected') {
      this.onConnectorConnect();
    }
  }

  private onConnectorConnect = () => {
    this.connectedConnector.on('change', (state) => {
      if (state.account) {
        this.accountChangeListeners.forEach((l) => l(state.account));
      }
      if (state.chain) {
        this.chainChangeListeners.forEach((l) =>
          l(state.chain.id, state.chain.unsupported)
        );
      }
    });

    this.connectedConnector.on('disconnect', () => {
      this.disconnectListeners.forEach((l) => l());
    });

    this.connectedConnector.on('message', (message) => {
      // Connect this for messages
    });
    console.log('sending to listeners: ', this.connectListeners);
    this.connectListeners.forEach((l) => l(this.connectedConnector));
  };

  private createClient() {
    const providers: ChainProviderFn[] = [];
    const { alchemy, infura, publicConf, appName } = this.config;
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

    this.connectors = [
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

    this.client = createClient({
      autoConnect: true,
      connectors: this.connectors,
      provider,
      webSocketProvider,
    }) as WagmiClient;
  }

  private attachClientListeners() {
    const unsubscribe = this.client.subscribe(
      ({ data, status }) => ({
        address: data?.account,
        status,
      }),
      (state, prevState) => {
        console.log('addr listener, ', {
          prevState,
          state,
        });
        if (
          state.address !== prevState.address &&
          state.status === 'connected'
        ) {
          this.onConnectorConnect();
        } else if (state.status !== prevState.status) {
          if (state.status === 'connected') {
            this.onConnectorConnect();
          } else if (prevState.status === 'connected') {
            this.onConnectorDisconnect();
          }
        }
      },
      {
        equalityFn: (a, b) => a.address === b.address && a.status === b.status,
        fireImmediately: true,
      }
    );

    const connectorListenUnsubscribe = this.client.subscribe(
      ({ connector }) => ({
        connector,
      }),
      (state, prevState) => {
        console.log('connector listener, ', {
          prevState,
          state,
        });
        if (
          state.connector?.id !== prevState.connector?.id &&
          // This fires twice sometimes.
          this.connectedConnector?.id !== state.connector?.id
        ) {
          this.onConnectorConnect();
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

  public onConnectorDisconnect = () => {
    this.connectedConnector.off('change');
    this.connectedConnector.off('disconnect');
    this.connectedConnector.off('message');
  };
}
