import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/use-localstorage';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ProviderOptions } from '.';

type InternalState = {
  active: boolean;
  loading: boolean;
  error?: Error | null;
  provider: any;
  library: Web3Provider | null;
  account: string | null | undefined;
};

const initialState = {
  active: false,
  loading: false,
  error: null,
  provider: null,
  library: null,
  account: undefined,
};

export const useWalletAuth = (options: ProviderOptions) => {
  const [internalState, setInternalState] =
    useState<InternalState>(initialState);

  const [connectWalletLocalStorage, setConnectWalletLocalStorage] =
    useLocalStorage('slashauth-connect-wallet');

  useEffect(() => {
    if (internalState.account && !connectWalletLocalStorage) {
      setConnectWalletLocalStorage('true');
    }
  }, [
    internalState.account,
    connectWalletLocalStorage,
    setConnectWalletLocalStorage,
  ]);

  const web3Modal = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const providerOptions = {};

    if (options?.coinbasewallet) {
      providerOptions['coinbasewallet'] = {
        package: CoinbaseWalletSDK,
        options: options.coinbasewallet,
      };
    }
    if (options?.walletconnect) {
      providerOptions['walletconnect'] = {
        package: WalletConnectProvider,
        options: options.walletconnect,
      };
    }

    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      disableInjectedProvider: false,
      providerOptions,
    });

    return web3Modal;
  }, [options]);

  const connectWallet = useCallback(
    async (transparent: boolean) => {
      if (!web3Modal) {
        return;
      }
      if (transparent && !web3Modal.cachedProvider) {
        // We will not do anything here because we don't want to force a popup.
        setInternalState({
          ...internalState,
          active: true,
          account: null,
        });
        return;
      }
      try {
        const provider = await web3Modal.connect();
        const library = new ethers.providers.Web3Provider(provider);
        const accounts = await library.listAccounts();
        setInternalState({
          ...internalState,
          provider,
          library,
          active: true,
          account: accounts.at(0) || null,
        });
        return accounts.at(0) || null;
      } catch (err) {
        setInternalState({
          ...internalState,
          error: err,
          account: internalState.account || null,
        });
      }
    },
    [internalState, web3Modal]
  );

  const handleDeactivate = useCallback(() => {
    if (!web3Modal) {
      return;
    }
    web3Modal.clearCachedProvider();
    setConnectWalletLocalStorage(undefined);
    setInternalState({
      ...internalState,
      provider: null,
      library: null,
      account: null,
      error: null,
    });
  }, [internalState, setConnectWalletLocalStorage, web3Modal]);

  return {
    active: internalState.active,
    loading: internalState.loading,
    account: internalState.account,
    library: internalState.library,
    error: internalState.error,
    connectOnStart: connectWalletLocalStorage,
    provider: internalState.provider,
    connectWallet,
    deactivate: handleDeactivate,
  };
};
