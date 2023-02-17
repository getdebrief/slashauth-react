import React, { useCallback, useMemo } from 'react';

import { useSafeState } from '../hooks';
import { createContextAndHook } from '../../../shared/utils';

import { useSignInContext } from '../components/sign-in/context';
import { useUser } from './user';

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

export const getIconsById = (id: string) => {
  switch (id) {
    case 'metaMask':
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/metamask.png';
    case 'coinbaseWallet':
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/coinbase.png';
    case 'walletConnect':
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/wallet-connect.png';
    case 'federated-google':
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/google.png';
    case 'federated-discord':
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/discord.png';
    case 'injected':
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/injected.png';
    default:
      return 'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';
  }
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
  const { loginMethods, selectedLoginMethod, setSelectedLoginMethod } =
    _useLoginMethods();
  const { excludeLoginMethodTypes, includeLoginMethodTypes, viewOnly } =
    useSignInContext();
  const user = useUser();

  const web3 = useMemo(() => {
    if (excludeLoginMethodTypes?.includes(LoginMethodType.Web3)) {
      return [];
    }

    if (
      includeLoginMethodTypes &&
      !includeLoginMethodTypes?.includes(LoginMethodType.Web3)
    ) {
      return [];
    }

    return loginMethods.filter(
      (m) => m.type === LoginMethodType.Web3
    ) as unknown as Web3LoginMethod[];
  }, [
    loginMethods,
    excludeLoginMethodTypes,
    includeLoginMethodTypes,
    user?.loginMethods,
    viewOnly,
  ]);

  const web2 = useMemo(() => {
    const loggedInMethods = user?.loginMethods || [];

    return loginMethods.filter(
      (m) =>
        m.type !== LoginMethodType.Web3 &&
        (viewOnly || !loggedInMethods.includes(m.type)) &&
        (!excludeLoginMethodTypes ||
          !excludeLoginMethodTypes.includes(m.type)) &&
        (!includeLoginMethodTypes || includeLoginMethodTypes.includes(m.type))
    ) as unknown as LoginMethod[];
  }, [
    loginMethods,
    excludeLoginMethodTypes,
    includeLoginMethodTypes,
    user?.loginMethods,
    viewOnly,
  ]);

  const setSelectedLoginMethodById = useCallback(
    (id?: string) => {
      setSelectedLoginMethod(id ? loginMethods.find((m) => m.id === id) : null);
    },
    [loginMethods, setSelectedLoginMethod]
  );

  return {
    web2,
    web3,
    selectedLoginMethod,
    setSelectedLoginMethodById,
  };
};

export { useLoginMethods, LoginMethodsProvider };
