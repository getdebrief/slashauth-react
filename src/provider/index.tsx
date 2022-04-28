import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import SlashAuthContext from '../auth-context';
import { initialAuthState } from '../auth-state';
import SlashAuthClient from '../client';
import { ICache } from '../cache';
import {
  CacheLocation,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  LoginNoRedirectNoPopupOptions,
  LogoutOptions,
  SlashAuthClientOptions,
} from '../global';
import { loginError, tokenError } from '../utils';
import { reducer } from './reducer';
import { useMetaMask, MetaMaskProvider } from '@slashauth/react-use-metamask';

export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * The main configuration to instantiate the `SlashAuthProvider`.
 */
export interface SlashAuthProviderOptions {
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
   * Read more about [creating a custom cache](https://github.com/auth0/auth0-spa-js#creating-a-custom-cache)
   */
  cache?: ICache;
  /**
   * If true, refresh tokens are used to fetch new access tokens from the Auth0 server. If false, the legacy technique of using a hidden iframe and the `authorization_code` grant with `prompt=none` is used.
   * The default setting is `false`.
   *
   * **Note**: Use of refresh tokens must be enabled by an administrator on your Auth0 client application.
   */
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
  /**
   * The default scope to be used on authentication requests.
   * The defaultScope defined in the Auth0Client is included
   * along with this scope
   */
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

const toSlashAuthClientOptions = (
  opts: SlashAuthProviderOptions
): SlashAuthClientOptions => {
  const { clientID, redirectUri, domain, ...validOpts } = opts;
  return {
    ...validOpts,
    domain: domain || 'https://api.slashauth.xyz',
    clientID: clientID,
    slashAuthClient: {
      name: 'slashAuth-react',
      version: '',
    },
  };
};

const Provider = (opts: SlashAuthProviderOptions): JSX.Element => {
  const [initialized, setInitialized] = useState(false);

  const { children, skipRedirectCallback, ...clientOpts } = opts;
  const [client] = useState(
    () => new SlashAuthClient(toSlashAuthClientOptions(clientOpts))
  );
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const metamaskProvider = useMetaMask();

  const connectAccount = useCallback(async () => {
    const accounts = await metamaskProvider.connect();
    if (!accounts || accounts.length === 0) {
      dispatch({ type: 'ERROR', error: new Error('No account connected') });
      return null;
    }
    if (accounts) {
      dispatch({ type: 'ACCOUNT_CONNECTED' });
    }
  }, [metamaskProvider]);

  const getNonceToSign = useCallback(async () => {
    if (!metamaskProvider.account) {
      dispatch({
        type: 'ERROR',
        error: new Error('No account connected through metamask'),
      });
      return;
    }
    dispatch({ type: 'NONCE_REQUEST_STARTED' });
    try {
      const nonceResp = await client.getNonceToSign({
        ...opts,
        address: metamaskProvider.account,
      });
      dispatch({
        type: 'NONCE_RECEIVED',
        nonceToSign: nonceResp,
      });
      return nonceResp;
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({
        type: 'ERROR',
        error: loginError({
          error: errorMessage,
        }),
      });
      return null;
    }
  }, [client, metamaskProvider, opts]);

  const loginNoRedirectNoPopup = useCallback(
    async (options: LoginNoRedirectNoPopupOptions) => {
      if (!metamaskProvider.account) {
        if (state.loginRequested) {
          // We did not get an account so let's return an error.
          dispatch({
            type: 'ERROR',
            error: new Error('No account connected through metamask'),
          });
        }
        dispatch({
          type: 'LOGIN_REQUESTED',
          loginType: 'LoginNoRedirectNoPopup',
          loginOptions: options,
        });
        // No metmask account is connected here...
        connectAccount();
        return;
      }
      dispatch({ type: 'LOGIN_FLOW_STARTED' });
      try {
        let fetchedNonce = state.nonceToSign;
        if (!state.nonceToSign || state.nonceToSign.length === 0) {
          fetchedNonce = await getNonceToSign();
        }
        const signature = await metamaskProvider.ethereum?.request({
          method: 'personal_sign',
          params: [fetchedNonce, metamaskProvider.account],
        });
        await client.loginNoRedirectNoPopup({
          ...options,
          address: metamaskProvider.account,
          signature,
        });
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        dispatch({
          type: 'ERROR',
          error: loginError({
            error: errorMessage,
          }),
        });
        return;
      }
      const account = await client.getAccount({});
      dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE', account });
    },
    [
      client,
      connectAccount,
      getNonceToSign,
      metamaskProvider.account,
      metamaskProvider.ethereum,
      state.loginRequested,
      state.nonceToSign,
    ]
  );

  useEffect(() => {
    if (state.loginRequested && metamaskProvider?.account) {
      dispatch({ type: 'LOGIN_REQUEST_FULFILLED' });
      // We should check to ensure it's login no redirect no popup type.
      loginNoRedirectNoPopup(state.loginOptions);
    }
  }, [
    loginNoRedirectNoPopup,
    metamaskProvider,
    metamaskProvider.account,
    state.loginOptions,
    state.loginRequested,
  ]);

  const logout = useCallback(
    async (opts: LogoutOptions = {}): Promise<void> => {
      const maybePromise = client.logout(opts);
      dispatch({ type: 'LOGOUT' });
      return maybePromise;
    },
    [client]
  );

  const getAccessTokenSilently = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (opts?: GetTokenSilentlyOptions): Promise<any> => {
      let token;
      try {
        token = await client.getTokenSilently(opts);
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        throw tokenError({
          error: errorMessage,
        });
      } finally {
        dispatch({
          type: 'INITIALIZED',
          account: await client.getAccount(),
        });
      }
      return token;
    },
    [client]
  );

  const checkSession = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (opts?: GetTokenSilentlyOptions): Promise<any> => {
      try {
        await client.checkSession(opts);
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        throw tokenError({
          error: errorMessage,
        });
      } finally {
        dispatch({
          type: 'INITIALIZED',
          account: await client.getAccount(),
        });
      }
    },
    [client]
  );

  const getIdTokenClaims = useCallback(
    (opts: GetIdTokenClaimsOptions) => client.getIdTokenClaims(opts),
    [client]
  );

  const connect = useCallback(async () => {
    try {
      dispatch({
        type: 'INITIALIZED',
        account: await client.getAccount(),
      });
      return metamaskProvider.connect();
    } finally {
      setTimeout(() => setInitialized(true), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(() => {
    return {
      ...state,
      connectedWallet: metamaskProvider.account,
      connect: connect,
      ethereum: metamaskProvider.ethereum,
      getAccessTokenSilently,
      getNonceToSign,
      loginNoRedirectNoPopup,
      getIdTokenClaims,
      logout,
      checkSession,
      initialized,
    };
  }, [
    state,
    metamaskProvider,
    getAccessTokenSilently,
    getNonceToSign,
    loginNoRedirectNoPopup,
    getIdTokenClaims,
    logout,
    checkSession,
    connect,
    initialized,
  ]);

  return (
    <SlashAuthContext.Provider value={contextValue}>
      {children}
    </SlashAuthContext.Provider>
  );
};

/**
 * ```jsx
 * <SlashAuthProvider
 *   domain={domain}
 *   clientId={clientId}
 *   redirectUri={window.location.origin}>
 *   <MyApp />
 * </SlashAuthProvider>
 * ```
 *
 * Provides the Auth0Context to its child components.
 */
const SlashAuthProvider = (opts: SlashAuthProviderOptions): JSX.Element => {
  return (
    <MetaMaskProvider>
      <Provider {...opts} />
    </MetaMaskProvider>
  );
};

export default SlashAuthProvider;
