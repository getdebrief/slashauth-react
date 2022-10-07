import React from 'react';

import { useSafeState } from '../hooks';
import { createContextAndHook } from '../../../shared/utils';

export enum LoginMethodType {
  Web3 = 'web3',
  MagicLink = 'magic-link',
  FederatedGoogle = 'federated-google',
  FederatedDiscord = 'federated-discord',
  FederatedTwitter = 'federated-twitter',
  Unknown = 'unknown',
}

export type LoginMethod = {
  ready: boolean;
  name: string;
  id: string;
  type: LoginMethodType;
};

export type Web3LoginMethod = LoginMethod & {
  type: LoginMethodType.Web3;
  chain: string;
};

type LoginMethodCtxValue = {
  loginMethods: LoginMethod[];
  selectedLoginMethod: LoginMethod | null;
  setSelectedLoginMethod: (loginMethod: LoginMethod | null) => void;
  setLoginMethods: React.Dispatch<React.SetStateAction<LoginMethod[]>>;
};

const [LoginMethodCtx, _useLoginMethods] =
  createContextAndHook<LoginMethodCtxValue>('LoginMethods');

const LoginMethodsProvider = (
  props: React.PropsWithChildren<{ loginMethods?: LoginMethod[] }>
) => {
  const [state, setState] = useSafeState<LoginMethod[]>(
    props.loginMethods || []
  );

  const [selectedLoginMethod, setSelectedLoginMethod] =
    useSafeState<LoginMethod | null>(null);

  const value = React.useMemo(
    () => ({
      value: {
        loginMethods: state,
        setLoginMethods: setState,
        selectedLoginMethod,
        setSelectedLoginMethod,
      },
    }),
    [state, setState, selectedLoginMethod, setSelectedLoginMethod]
  );
  return (
    <LoginMethodCtx.Provider value={value}>
      {props.children}
    </LoginMethodCtx.Provider>
  );
};

const useLoginMethods = () => {
  const {
    loginMethods,
    setLoginMethods,
    selectedLoginMethod,
    setSelectedLoginMethod,
  } = _useLoginMethods();

  return {
    loginMethods,
    setLoginMethods,
    selectedLoginMethod,
    setSelectedLoginMethod,
  };
};

export { useLoginMethods, LoginMethodsProvider };
