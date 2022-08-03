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
  client: WagmiClient;

  private accountChangeListeners: AccountChangeListener[] = [];
  private chainChangeListeners: ChainChangeListener[] = [];
  private connectListeners: ConnectListener[] = [];
  private disconnectListeners: DisconnectListener[] = [];

  connectedConnector: Connector;

  constructor({ appName, alchemy, infura, publicConf }: Config) {
    const providers: ChainProviderFn[] = [];
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

  public async clearState() {
    await this.connectedConnector?.disconnect();
    this.client.clearState();
  }

  public async autoConnect() {
    try {
      const resp = await this.client.autoConnect();
      if (resp) {
        const connector = this.client.connector;
        this.onConnectorConnect(connector);
        return connector;
      }
    } catch (err) {
      console.error('error: ', err);
      // Silently catch the error.
    }
    return null;
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

  public onConnectorConnect = (connector: Connector) => {
    this.connectedConnector = connector;

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

    this.connectListeners.forEach((l) => l(this.connectedConnector));
  };

  public onConnectorDisconnect = () => {
    this.connectedConnector.off('change');
    this.connectedConnector.off('disconnect');
    this.connectedConnector.off('message');
  };
}
