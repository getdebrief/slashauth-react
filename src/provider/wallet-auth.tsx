import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/use-localstorage';
import { ProviderOptions } from '.';
import { ModalCore } from '../modal/core';
import { WagmiConnector } from './wagmi-connectors';
import { Connector, Provider, Signer } from '@wagmi/core';

type InternalState = {
  active: boolean;
  loading: boolean;
  error?: Error | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: Provider | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: Signer | null;
  account: string | null | undefined;
};

const initialState = {
  active: false,
  loading: false,
  error: null,
  provider: null,
  signer: null,
  account: undefined,
};

export const useWalletAuth = (options: ProviderOptions) => {
  const [internalState, setInternalState] =
    useState<InternalState>(initialState);

  const [connectModal, setConnectModal] = useState<ModalCore | null>(null);
  const [wagmiConnector, setWagmiConnector] = useState<WagmiConnector | null>(
    null
  );

  const _onAccountChange = (account: string | null) => {
    setInternalState((prevState) => ({
      ...prevState,
      account,
    }));
  };

  const _onChainChange = (chainId: number | string, unsupported: boolean) => {
    console.log('chain changed');
  };

  const handleDeactivate = useCallback(() => {
    setInternalState((prevState) => ({
      ...prevState,
      provider: null,
      library: null,
      account: null,
      error: null,
    }));
    return;
  }, []);

  const _onConnect = useCallback(async (connector: Connector) => {
    const provider = await connector.getProvider();
    const signer = await connector.getSigner();
    const account = await connector.getAccount();
    setInternalState((prevState) => ({
      ...prevState,
      provider,
      signer,
      active: true,
      account: account,
    }));
    return account || null;
  }, []);

  if (!wagmiConnector) {
    const extractedOptions = {
      ...options,
    };

    if (!options.infura && options.walletconnect?.infuraId) {
      extractedOptions.infura = {
        apiKey: options.walletconnect.infuraId,
      };
    }

    if (!options.appName && options.coinbasewallet?.appName) {
      extractedOptions.appName = options.coinbasewallet.appName;
    }

    const connector = new WagmiConnector({
      appName: extractedOptions.appName,
      alchemy: extractedOptions?.alchemy,
      infura: extractedOptions?.infura,
      publicConf: extractedOptions?.publicConf,
    });

    connector.onAccountChange(_onAccountChange);
    connector.onChainChange(_onChainChange);
    connector.onDisconnect(handleDeactivate);
    connector.onConnect(_onConnect);

    setWagmiConnector(connector);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  if (wagmiConnector && !connectModal) {
    const modalCore = new ModalCore(wagmiConnector);
    setConnectModal(modalCore);

    wagmiConnector.onConnect(() => modalCore.hideModal());
  }

  const connectWallet = useCallback(
    async (transparent: boolean) => {
      if (!connectModal) {
        return;
      }
      if (transparent) {
        let isConnected = false;
        try {
          isConnected = !!(await wagmiConnector.autoConnect());
        } catch (err) {
          // Silently ignore error
        }
        if (!isConnected) {
          setInternalState({
            ...internalState,
            active: true,
            account: null,
          });
          return;
        } else {
          return await _onConnect(wagmiConnector.connectedConnector);
        }
      }
      try {
        await connectModal.toggleModal();
        return null;
      } catch (err) {
        setInternalState({
          ...internalState,
          error: err,
          account: internalState.account || null,
        });
      }
    },
    [_onConnect, connectModal, internalState, wagmiConnector]
  );

  return {
    active: internalState.active,
    loading: internalState.loading,
    account: internalState.account,
    signer: internalState.signer,
    error: internalState.error,
    provider: internalState.provider,
    connectWallet,
    deactivate: handleDeactivate,
  };
};
