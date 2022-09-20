import { CoinbaseWalletSDKOptions } from '@coinbase/wallet-sdk/dist/CoinbaseWalletSDK';
import { IWalletConnectProviderOptions } from '@walletconnect/types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SignInOptions {}

export interface CoreSlashAuth {
  version?: string;

  // TODO: add user
  openSignInModal: (options: SignInOptions) => void;
  closeSignInModal: () => void;

  isReady: () => boolean;
}

export type ProviderOptions = {
  appName?: string;
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
