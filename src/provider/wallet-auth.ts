import { useEthers } from '@usedapp/core';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import { useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/use-localstorage';

type InternalState = {
  loading: boolean;
  error?: Error | null;
};

const initialState = {
  loading: false,
  error: null,
};

export const useWalletAuth = () => {
  const [internalState, setInternalState] =
    useState<InternalState>(initialState);

  const [connectWalletLocalStorage, setConnectWalletLocalStorage] =
    useLocalStorage('slashauth-connect-wallet');

  const {
    active,
    account,
    library,
    error,
    activate,
    deactivate,
    activateBrowserWallet,
  } = useEthers();

  useEffect(() => {
    if (account && !connectWalletLocalStorage) {
      setConnectWalletLocalStorage('true');
    }
  }, [account, connectWalletLocalStorage, setConnectWalletLocalStorage]);

  const getWeb3Modal = () => {
    const providerOptions = {
      injected: {
        display: {
          name: 'Metamask',
          description: 'Connect with the provider in your Browser',
        },
        package: null,
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '3fd4907115b84c7eb48e95514768a4e8',
          bridge: 'https://bridge.walletconnect.org',
        },
      },
    };
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      disableInjectedProvider: false,
      providerOptions,
    });

    return web3Modal;
  };

  const activateProvider = async () => {
    setInternalState({
      ...internalState,
      loading: true,
    });

    const web3Modal = getWeb3Modal();

    try {
      const provider = await web3Modal.connect();
      await activate(provider);
      setInternalState({
        ...internalState,
        error: null,
        loading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setInternalState({
        ...internalState,
        error: error,
        loading: false,
      });
    }
  };

  const handleDeactivate = () => {
    deactivate();
    getWeb3Modal().clearCachedProvider();
    setConnectWalletLocalStorage(undefined);
  };

  return {
    loading: internalState.loading,
    active,
    account,
    library,
    error,
    connectOnStart: connectWalletLocalStorage,
    activateProvider,
    deactivate: handleDeactivate,
    activateBrowserWallet,
  };
};
