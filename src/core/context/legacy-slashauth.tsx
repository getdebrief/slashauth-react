import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Account,
  CacheLocation,
  GetIdTokenClaimsOptions,
  GetTokensOptions,
  IdToken,
  LogoutOptions,
} from '../../shared/global';
import { SlashAuthStyle } from '../../shared/types';
import { ObjectMap } from '../../shared/utils/object';
import { uninitializedStub } from '../../shared/utils/stub';
import { ProviderOptions, SignInOptions } from '../../types/slashauth';
import { SlashAuth } from '../slashauth';
import { useCoreSlashAuth } from '../ui/context/core-slashauth';
import { SlashAuthUIProvider } from '../ui/context/slashauth';
import { SlashAuthWagmiProvider, useWeb3Manager } from './wagmi-provider';

type AuthFunctions = {
  getAccessTokenSilently: (options?: GetTokensOptions) => Promise<string>;

  openSignIn: (options?: SignInOptions) => Promise<void>;

  logout: (options?: LogoutOptions) => Promise<void> | void;

  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  checkSession: (options?: GetTokensOptions) => Promise<boolean>;
};

type UIFunctions = {
  mountSignIn: (node: HTMLDivElement, options: SignInOptions) => void;
  mountDropDown: (node: HTMLDivElement, testContext?: SlashAuth) => void;
  updateAppearanceOverride: (overrides?: SlashAuthStyle) => void;
};

type SlashAuthAPIFunctions = {
  hasRole: (roleName: string) => Promise<boolean>;
  hasOrgRole: (organizationID: string, roleName: string) => Promise<boolean>;
  getRoleMetadata: (roleName: string) => Promise<ObjectMap>;
};

type Web3Fields = {
  connectedWallet: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethereum: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;

  connect: (transparent: boolean) => Promise<string | null>;
};

type UserFields = {
  isAuthenticated: boolean;
  account?: Account;
};

type StateContextFields = {
  error?: Error;
  isLoading: boolean;
  initialized: boolean;
  isTwoStep: boolean;
};

type LegacyContextFields = {
  loginFlowID: null;
  step: null;
  nonceToSign: null;
  isLoggingIn: boolean;
  loginRequested: boolean;
  loginOptions: null;
  loginType: null;
  requirements: null;
  additionalInfo: null;
  codeVerifier: null;
  isLoginReady: null;
  authedWallet: null;
};

const legacyContextFields = {
  loginFlowID: null,
  step: null,
  nonceToSign: null,
  isLoggingIn: false,
  loginRequested: false,
  loginOptions: null,
  loginType: null,
  requirements: null,
  additionalInfo: null,
  codeVerifier: null,
  isLoginReady: null,
  authedWallet: null,
};

export type SlashAuthContextProviderState = AuthFunctions &
  SlashAuthAPIFunctions &
  UIFunctions &
  Web3Fields &
  UserFields &
  StateContextFields &
  LegacyContextFields;

export interface SlashAuthProviderOptions {
  providers?: ProviderOptions;
  /**
   * The child nodes your Provider has wrapped
   */
  children?: React.ReactNode;
  /**
   * Your SlashAuth account domain such as `'login.slashauth.xyz'`
   */
  domain?: string;
  /**
   * The issuer to be used for validation of JWTs, optionally defaults to the domain above
   */
  issuer?: string;
  /**
   * The Client ID found on your Application settings page
   */
  clientID: string;
  /**
   * The value in seconds used to account for clock skew in JWT expirations.
   * Typically, this value is no more than a minute or two at maximum.
   * Defaults to 60s.
   */
  leeway?: number;
  /**
   * The location to use when storing cache data. Valid values are `memory` or `localstorage`.
   * The default setting is `memory`.
   *
   */
  cacheLocation?: CacheLocation;
  /**
   * Specify a custom cache implementation to use for token storage and retrieval. This setting takes precedence over `cacheLocation` if they are both specified.
   *
   * NOTE: Not exposing this as exporting ICache type breaks ts < 3.8
   */
  // cache?: ICache;
  // useRefreshTokens?: boolean;
  /**
   * A maximum number of seconds to wait before declaring background calls to /authorize as failed for timeout
   * Defaults to 60s.
   */
  // authorizeTimeoutInSeconds?: number;
  /**
   * Changes to recommended defaults, like defaultScope
   */
  // advancedOptions?: {};
  /**
   * Maximum allowable elapsed time (in seconds) since authentication.
   * If the last time the user authenticated is greater than this value,
   * the user must be reauthenticated.
   */
  // maxAge?: string | number;
  // scope?: string;
  /**
   * The default audience to be used for requesting API access.
   */
  // audience?: string;
  /**
   * The Id of an organization to log in to.
   *
   * This will specify an `organization` parameter in your user's login request and will add a step to validate
   * the `org_id` claim in your user's ID Token.
   */
  // organization?: string;
  /**
   * The Id of an invitation to accept. This is available from the user invitation URL that is given when participating in a user invitation flow.
   */
  // invitation?: string;
  /**
   * The name of the connection configured for your application.
   * If null, it will redirect to the SlashAuth Login Page and show
   * the Login Widget.
   */
  // connection?: string;
  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function SlashAuthProvider(
  props: SlashAuthProviderOptions
): JSX.Element | null {
  return (
    <SlashAuthWagmiProvider options={props.providers}>
      {/* eslint-disable-next-line react/jsx-pascal-case */}
      <_SlashAuthProvider {...props}>{props.children}</_SlashAuthProvider>
    </SlashAuthWagmiProvider>
  );
}

export function _SlashAuthProvider(
  props: SlashAuthProviderOptions
): JSX.Element | null {
  const creating = useRef(false);
  const [slashAuth, setSlashAuth] = useState<SlashAuth | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [, setIsReady] = useState(false);

  const web3Manager = useWeb3Manager();

  const { clientID, redirectUri, domain, ...validOpts } = props;
  if (!clientID || clientID === '') {
    throw new Error('clientID is required');
  }

  useEffect(() => {
    if (!creating.current && !slashAuth && clientID && web3Manager) {
      creating.current = true;
      const sa = new SlashAuth(web3Manager, {
        ...validOpts,
        domain: domain || 'https://slashauth.com',
        clientID: clientID,
        slashAuthClient: {
          name: 'slashAuth-react',
          version: '',
        },
      });
      setSlashAuth(sa);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientID, domain, slashAuth, validOpts, web3Manager]);

  useEffect(() => {
    if (slashAuth && web3Manager && !initialized) {
      const unsub = slashAuth.addListener(({ core }) => {
        if (core.isReady) {
          setIsReady(true);
          unsub();
        }
      });
      slashAuth.initialize();
      setInitialized(true);
    }
  }, [initialized, slashAuth, web3Manager]);

  if (!slashAuth || !slashAuth?.isReady() || !web3Manager) {
    return <div />;
  }

  return (
    <SlashAuthUIProvider slashAuth={slashAuth}>
      <LegacyProvider>{props.children}</LegacyProvider>
    </SlashAuthUIProvider>
  );
}

type UnmountCallback = () => void;

type _Props = {
  children: React.ReactNode;
};

const emptyContext = {
  ...legacyContextFields,
  connect: uninitializedStub,
  hasRole: uninitializedStub,
  hasOrgRole: uninitializedStub,
  getRoleMetadata: uninitializedStub,
  getAccessTokenSilently: uninitializedStub,
  loginNoRedirectNoPopup: uninitializedStub,
  openSignIn: uninitializedStub,
  logout: uninitializedStub,
  getIdTokenClaims: uninitializedStub,
  checkSession: uninitializedStub,
  mountSignIn: uninitializedStub,
  mountDropDown: uninitializedStub,
  updateAppearanceOverride: uninitializedStub,
  connectedWallet: null,
  ethereum: null,
  provider: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  isTwoStep: false,
};

const SlashAuthContext =
  React.createContext<SlashAuthContextProviderState>(emptyContext);

export function LegacyProvider({ children }: _Props) {
  const slashAuth = useCoreSlashAuth();

  const connect = useCallback(
    async (transparent?: boolean): Promise<string> => {
      return slashAuth.connectWallet({ transparent });
    },
    [slashAuth]
  );

  const hasRole = useCallback(
    async (role: string): Promise<boolean> => {
      return slashAuth.client.hasRole(role);
    },
    [slashAuth.client]
  );

  const hasOrgRole = useCallback(
    async (organizationID: string, role: string): Promise<boolean> => {
      return slashAuth.client.hasOrgRole(organizationID, role);
    },
    [slashAuth.client]
  );

  const getRoleMetadata = useCallback(
    async (role: string): Promise<ObjectMap> => {
      return slashAuth.client.getRoleMetadata(role);
    },
    [slashAuth.client]
  );

  const getAccessTokenSilently = useCallback(
    async (options?: GetTokensOptions): Promise<string> => {
      return slashAuth.client.getTokens(options);
    },
    [slashAuth.client]
  );

  const openSignIn = useCallback(
    async (options?: SignInOptions): Promise<void> => {
      return slashAuth.openSignIn(options);
    },
    [slashAuth]
  );

  const logout = useCallback(
    async (options?: LogoutOptions): Promise<void> => {
      return slashAuth.logout(options);
    },
    [slashAuth]
  );

  const getIdTokenClaims = useCallback(
    async (options?: GetIdTokenClaimsOptions): Promise<IdToken> => {
      return slashAuth.client.getIdTokenClaims(options);
    },
    [slashAuth.client]
  );

  const checkSession = useCallback(async (): Promise<boolean> => {
    return slashAuth.client.checkSession();
  }, [slashAuth.client]);

  const mountSignIn = useCallback(
    async (
      node: HTMLDivElement,
      options: SignInOptions = {}
    ): Promise<UnmountCallback> => {
      const unmountCallback = () => {
        slashAuth.unmountComponent(node);
      };
      slashAuth.mountSignIn(node, options);
      return unmountCallback;
    },
    [slashAuth]
  );
  const mountDropDown = useCallback(
    async (
      node: HTMLDivElement,
      testContext?: SlashAuth
    ): Promise<UnmountCallback> => {
      const unmountCallback = () => {
        slashAuth.unmountComponent(node);
      };
      slashAuth.mountDropDown(node, testContext);
      return unmountCallback;
    },
    [slashAuth]
  );

  const updateAppearanceOverride = useCallback(
    (overrides?: SlashAuthStyle) => {
      slashAuth.updateAppearanceOverride(overrides);
    },
    [slashAuth]
  );

  const [state, setState] = React.useState<SlashAuthContextProviderState>({
    ...emptyContext,
    connect,
    hasRole,
    hasOrgRole,
    getRoleMetadata,
    getAccessTokenSilently,
    logout,
    getIdTokenClaims,
    checkSession,
    mountSignIn,
    mountDropDown,
    updateAppearanceOverride,
    openSignIn,
  });

  useEffect(() => {
    const unsubscribe = slashAuth.addListener((payload) => {
      setState((prevState) => ({
        ...prevState,
        account: payload.user.account,
        connectedWallet: payload.web3.address,
        ethereum: payload.web3.provider,
        provider: payload.web3.provider,
        isAuthenticated: payload.user.loggedIn,
        isLoading: false,
        initialized: payload.core.isReady,
        isTwoStep: false,
      }));
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SlashAuthContext.Provider value={state}>
      {children}
    </SlashAuthContext.Provider>
  );
}

export const useSlashAuth = (): SlashAuthContextProviderState => {
  const context = React.useContext(SlashAuthContext);
  if (context === undefined) {
    throw new Error('useSlashAuth must be used within a SlashAuthProvider');
  }
  return context;
};
