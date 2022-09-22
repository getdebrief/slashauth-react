import React, { useEffect } from 'react';
import { createContextAndHook } from '../../../shared/utils';
import { Web3Manager, Web3ManagerEventType } from '../../web3/manager';
import { useSafeState } from '../hooks';

type Web3LoginState = {
  connected: boolean;
  address: string;
  nonce: string;
  signature: string;
  web3Manager: Web3Manager;
};

type Web3LoginStateCtxValue = {
  state: Web3LoginState;
  setState: React.Dispatch<React.SetStateAction<Web3LoginState>>;
};

const [Web3LoginStateCtx, _useWeb3LoginState] =
  createContextAndHook<Web3LoginStateCtxValue>('Web3LoginState');

const Web3LoginStateProvider = (
  props: React.PropsWithChildren<{ manager: Web3Manager }>
) => {
  const [state, setState] = useSafeState<Web3LoginState>({
    connected: props.manager.connected,
    address: props.manager.address,
    nonce: undefined,
    signature: undefined,
    web3Manager: props.manager,
  });

  const value = React.useMemo(
    () => ({ value: { state, setState } }),
    [state, setState]
  );

  useEffect(() => {
    const listener = (type: Web3ManagerEventType, mgr: Web3Manager) => {
      if (type === 'connect') {
        setState((s) => ({ ...s, connected: true, address: mgr.address }));
      } else if (type === 'disconnect') {
        setState((s) => ({ ...s, connected: false, address: undefined }));
      }
    };
    props.manager.onEvent(listener);
    return () => {
      props.manager.offEvent(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        connected: false,
        web3Manager: state.web3Manager,
      }),
    setNonce: (nonce: string) => setState((s) => ({ ...s, nonce })),
    setSignature: (signature: string) => setState((s) => ({ ...s, signature })),
  };
};

export { useWeb3LoginState, Web3LoginStateProvider };

export const withWeb3LoginStateProvider = <T,>(
  manager: Web3Manager,
  Component: React.ComponentType<T>
) => {
  return (props: T) => {
    return (
      <Web3LoginStateProvider manager={manager}>
        <Component {...props} />
      </Web3LoginStateProvider>
    );
  };
};
