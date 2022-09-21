import React from 'react';

import { useSafeState } from '../hooks';
import { createContextAndHook } from '../../../shared/utils';

export enum LoginMethodType {
  Web3 = 'web3',
  MagicLink = 'magic-link',
  FederatedGoogle = 'federated-google',
  FederatedDiscord = 'federated-discord',
}

export type LoginMethod = {
  ready: boolean;
  name: string;
  id: string;
  type: string;
};

export type Web3LoginMethod = LoginMethod & {
  type: 'web3';
  chain: string;
};

type EthLoginMethod = Web3LoginMethod & {
  chain: 'eth';
};

type LoginMethodCtxValue = {
  loginMethods: LoginMethod[];
  setLoginMethods: React.Dispatch<React.SetStateAction<LoginMethod[]>>;
};

const [LoginMethodCtx, _useLoginMethods] =
  createContextAndHook<LoginMethodCtxValue>('LoginMethods');

const LoginMethodsProvider = (props: React.PropsWithChildren<any>) => {
  const [state, setState] = useSafeState<LoginMethod[]>([]);

  const value = React.useMemo(
    () => ({ value: { loginMethods: state, setLoginMethods: setState } }),
    [state, setState]
  );
  return (
    <LoginMethodCtx.Provider value={value}>
      {props.children}
    </LoginMethodCtx.Provider>
  );
};

const useLoginMethods = () => {
  const { loginMethods, setLoginMethods } = _useLoginMethods();

  return {
    loginMethods,
    setLoginMethods,
  };
};

export { useLoginMethods, LoginMethodsProvider };
