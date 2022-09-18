import { Connector } from '@wagmi/core';
import React from 'react';
import { createContextAndHook } from '../../../shared/utils';
import { useSafeState } from '../hooks';
import { Web3LoginMethod } from './login-methods';

type Web3LoginState = {
  address: string;
  nonce: string;
  signature: string;
  connector: Connector;
  loginMethod: Web3LoginMethod;
};

type Web3LoginStateCtxValue = {
  state: Web3LoginState;
  setState: React.Dispatch<React.SetStateAction<Web3LoginState>>;
};

const [Web3LoginStateCtx, _useWeb3LoginState] =
  createContextAndHook<Web3LoginStateCtxValue>('Web3LoginState');

const Web3LoginStateProvider = (props: React.PropsWithChildren<any>) => {
  const [state, setState] = useSafeState<Web3LoginState>({
    address: undefined,
    nonce: undefined,
    signature: undefined,
    connector: undefined,
    loginMethod: undefined,
  });

  const value = React.useMemo(
    () => ({ value: { state, setState } }),
    [state, setState]
  );

  return (
    <Web3LoginStateCtx.Provider value={value}>
      {props.children}
    </Web3LoginStateCtx.Provider>
  );
};

const useWeb3LoginState = () => {
  const { state, setState } = _useWeb3LoginState();

  return {
    ...state,
    clearLoginFlow: () =>
      setState({
        address: undefined,
        nonce: undefined,
        signature: undefined,
        connector: undefined,
        loginMethod: undefined,
      }),
    setLoginMethod: (loginMethod: Web3LoginMethod) =>
      setState((s) => ({ ...s, loginMethod })),
    setAddress: (address: string) => setState((s) => ({ ...s, address })),
    setNonce: (nonce: string) => setState((s) => ({ ...s, nonce })),
    setSignature: (signature: string) => setState((s) => ({ ...s, signature })),
    setConnector: (connector: Connector) =>
      setState((s) => ({ ...s, connector })),
  };
};

export { useWeb3LoginState, Web3LoginStateProvider };

export const withWeb3LoginStateProvider = <T,>(
  Component: React.ComponentType<T>
) => {
  return (props: T) => {
    return (
      <Web3LoginStateProvider>
        <Component {...props} />
      </Web3LoginStateProvider>
    );
  };
};
