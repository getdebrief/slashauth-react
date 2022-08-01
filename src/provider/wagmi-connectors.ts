import { QueryClient } from 'react-query';
import {
  useAccount,
  ChainProviderFn,
  Client,
  configureChains,
  Connector,
  createClient,
  defaultChains,
  useConnect,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

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

type WagmiClient = Client & {
  queryClient: QueryClient;
};

export class WagmiConnector {
  connectors: Connector[];
  client: WagmiClient;

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
}
