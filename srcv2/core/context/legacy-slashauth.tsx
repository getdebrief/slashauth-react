import React, { useEffect } from 'react';
import {
  Account,
  CacheLocation,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  IdToken,
  LoginNoRedirectNoPopupOptions,
  LogoutOptions,
} from '../../shared/global';
import { ObjectMap } from '../../shared/utils/object';
import { uninitializedStub } from '../../shared/utils/stub';
import { ProviderOptions } from '../../types/slashauth';
import { SlashAuth } from '../slashauth';
import { useCoreSlashAuth } from '../ui/context/core-slashauth';
import { SlashAuthUIProvider } from '../ui/context/slashauth';

type AuthFunctions = {
  getAccessTokenSilently: (
    options?: GetTokenSilentlyOptions
  ) => Promise<string>;

  loginNoRedirectNoPopup: (
    options?: LoginNoRedirectNoPopupOptions
  ) => Promise<void>;

  logout: (options?: LogoutOptions) => Promise<void> | void;

  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  checkSession: (options?: GetTokenSilentlyOptions) => Promise<boolean>;
};

type SlashAuthAPIFunctions = {
  hasRole: (roleName: string) => Promise<boolean>;
  hasOrgRole: (organizationID: string, roleName: string) => Promise<boolean>;
  getRoleMetadata: (roleName: string) => Promise<ObjectMap>;
};

type Web3Fields = {
  connectedWallet: string | null;
  ethereum: any;
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
  const { clientID, redirectUri, domain, ...validOpts } = props;
  if (!clientID || clientID === '') {
    throw new Error('clientID is required');
  }
  const slashAuth = new SlashAuth({
    ...validOpts,
    domain: domain || 'https://slashauth.com',
    clientID: clientID,
    slashAuthClient: {
      name: 'slashAuth-react',
      version: '',
    },
  });

  slashAuth.initialize();

  return (
    <SlashAuthUIProvider slashAuth={slashAuth}>
      <LegacyProvider>{props.children}</LegacyProvider>
    </SlashAuthUIProvider>
  );
}

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
  logout: uninitializedStub,
  getIdTokenClaims: uninitializedStub,
  checkSession: uninitializedStub,
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

  const [state, setState] = React.useState<SlashAuthContextProviderState>({
    ...emptyContext,
  });

  useEffect(() => {
    const unsubscribe = slashAuth.addListener((payload) => {
      console.log('received payload: ', payload);
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
