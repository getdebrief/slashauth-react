import { useCallback, useEffect, useState } from 'react';
import { Connector, Provider, Signer } from '@wagmi/core';
import {
  ACCOUNT_CHANGE_EVENT,
  ACCOUNT_CONNECTED_EVENT,
  CHAIN_CHANGE_EVENT,
  CONNECT_EVENT,
  DISCONNECT_EVENT,
  eventEmitter,
} from '../events';

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

export const useWalletAuth = () => {
  const [internalState, setInternalState] =
    useState<InternalState>(initialState);

  const _onAccountChange = (input: { account: string | null }) => {
    setInternalState((prevState) => ({
      ...prevState,
      account: input.account,
    }));
  };

  const _onChainChange = (input: {
    chainId: number | string;
    unsupported: boolean;
  }) => {
    console.log('chain changed');
  };

  const _onConnect = async (input: { connector: Connector }) => {
    const provider = await input.connector.getProvider();
    const signer = await input.connector.getSigner();
    const account = await input.connector.getAccount();
    setInternalState((prevState) => ({
      ...prevState,
      provider,
      signer,
      active: true,
      account,
    }));
    if (account) {
      eventEmitter.emit(ACCOUNT_CONNECTED_EVENT, {
        account,
      });
    }
    return account || null;
  };

  const handleDeactivate = useCallback(() => {
    // wagmiConnector?.clearState();

    setInternalState((prevState) => ({
      ...prevState,
      provider: null,
      library: null,
      account: null,
      error: null,
    }));
    return;
  }, []);

  useEffect(() => {
    eventEmitter.on(ACCOUNT_CHANGE_EVENT, _onAccountChange);
    eventEmitter.on(CHAIN_CHANGE_EVENT, _onChainChange);
    eventEmitter.on(DISCONNECT_EVENT, handleDeactivate);
    eventEmitter.on(CONNECT_EVENT, _onConnect);
  });

  // const connectWallet = useCallback(
  //   async (transparent: boolean) => {

  //   }
  // )

  // const connectWallet = useCallback(
  //   async (transparent: boolean) => {
  //     if (!connectModal) {
  //       return;
  //     }
  //     if (transparent) {
  //       let isConnected = false;
  //       try {
  //         isConnected = !!(await wagmiConnector.autoConnect());
  //       } catch (err) {
  //         // Silently ignore error
  //       }
  //       if (!isConnected) {
  //         setInternalState({
  //           ...internalState,
  //           active: true,
  //           account: null,
  //         });
  //         return;
  //       } else {
  //         return await _onConnect(wagmiConnector.connectedConnector);
  //       }
  //     }
  //     try {
  //       await connectModal.toggleModal();
  //       return null;
  //     } catch (err) {
  //       setInternalState({
  //         ...internalState,
  //         error: err,
  //         account: internalState.account || null,
  //       });
  //     }
  //   },
  //   [_onConnect, connectModal, internalState, wagmiConnector]
  // );

  return {
    active: internalState.active,
    loading: internalState.loading,
    account: internalState.account,
    signer: internalState.signer,
    error: internalState.error,
    provider: internalState.provider,
    // connectWallet,
    deactivate: handleDeactivate,
  };
};
