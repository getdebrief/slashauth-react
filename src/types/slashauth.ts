import { CoinbaseWalletSDKOptions } from '@coinbase/wallet-sdk/dist/CoinbaseWalletSDK';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { Chain, Client } from 'wagmi';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SignInOptions {
  walletConnectOnly?: boolean;
  viewOnly?: boolean;
}

export interface ConnectOptions {
  transparent?: boolean;
}

export interface CoreSlashAuth {
  version?: string;

  // TODO: add user
  openSignInModal: (options: SignInOptions) => void;
  closeSignInModal: () => void;

  isReady: () => boolean;
}

export type WagmiOptions = {
  wagmiClient?: unknown;
  enabledChains?: Chain[];
  pollingIntervalMs?: number;
};

export type ProviderOptions = {
  appName?: string;
  // Use this to override the created wagmi client
  wagmi?: WagmiOptions;
  coinbasewallet?: CoinbaseWalletSDKOptions;
  walletconnect?: IWalletConnectProviderOptions;
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
