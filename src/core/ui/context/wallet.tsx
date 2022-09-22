import { Provider } from '@wagmi/core';
import { Signer } from 'ethers';
import React from 'react';
import { assertContextExists } from '../utils/context';

export type WalletProps = {
  connected: boolean;
  provider: Provider | undefined;
  signer: Signer | undefined;
  address: string | undefined;
};

export const SlashAuthWalletContext = React.createContext<
  WalletProps | undefined
>(undefined);
SlashAuthWalletContext.displayName = 'SlashAuthWalletContext';

export function useWallet(): WalletProps {
  const context = React.useContext(SlashAuthWalletContext);
  assertContextExists(context, 'SlashAuthWalletContext');
  return context;
}
