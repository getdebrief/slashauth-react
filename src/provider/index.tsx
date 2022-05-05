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
  Network,
  SlashAuthClientOptions,
} from '../global';
import { loginError, tokenError } from '../utils';
import { reducer } from './reducer';
import { useWalletAuth } from './wallet-auth';
import { DAppProvider } from '@usedapp/core';
import { useLocalStorage } from '../hooks/use-localstorage';

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

  const {
    active,
    account,
    library,
    connectOnStart,
    activateProvider,
    deactivate,
  } = useWalletAuth();

  useEffect(() => {
    if (connectOnStart && !active) {
      activateProvider();
    }
  }, [connectOnStart]);

  const connectAccount = useCallback(async () => {
    if (!active) {
      await activateProvider();
    }
    return account;
  }, [account, activateProvider]);

  useEffect(() => {
    if (account && state.loginRequested) {
      dispatch({ type: 'ACCOUNT_CONNECTED' });
    }
  }, [account]);

  const getNonceToSign = useCallback(async () => {
    if (!account) {
      dispatch({
        type: 'ERROR',
        error: new Error('No account connected'),
      });
      return;
    }
    dispatch({ type: 'NONCE_REQUEST_STARTED' });
    try {
      const nonceResp = await client.getNonceToSign({
        ...opts,
        address: account,
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
  }, [account, client, opts]);

  const loginNoRedirectNoPopup = useCallback(
    async (options: LoginNoRedirectNoPopupOptions) => {
      if (!account) {
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
        const signature = await library.getSigner().signMessage(fetchedNonce);
        await client.loginNoRedirectNoPopup({
          ...options,
          address: account,
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
      // const account = await client.getAccount({});
      dispatch({
        type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE',
        account: {
          address: account,
          network: Network.Ethereum,
        },
      });
    },
    [
      account,
      client,
      connectAccount,
      getNonceToSign,
      library,
      state.loginRequested,
      state.nonceToSign,
    ]
  );

  useEffect(() => {
    if (state.loginRequested && account) {
      dispatch({ type: 'LOGIN_REQUEST_FULFILLED' });
      // We should check to ensure it's login no redirect no popup type.
      loginNoRedirectNoPopup(state.loginOptions);
    }
  }, [
    loginNoRedirectNoPopup,
    state.loginOptions,
    state.loginRequested,
    account,
  ]);

  const logout = useCallback(
    async (opts: LogoutOptions = {}): Promise<void> => {
      const maybePromise = client.logout(opts);
      deactivate();
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
      await activateProvider();
      return account;
    } finally {
      setTimeout(() => setInitialized(true), 250);
    }
  }, [activateProvider, client]);

  const contextValue = useMemo(() => {
    return {
      ...state,
      connectedWallet: account,
      connect,
      ethereum: library,
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
    account,
    connect,
    connectAccount,
    library,
    getAccessTokenSilently,
    getNonceToSign,
    loginNoRedirectNoPopup,
    getIdTokenClaims,
    logout,
    checkSession,
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
    <DAppProvider
      config={{
        readOnlyUrls: {},
        pollingInterval: 100000000,
        autoConnect: false,
      }}
    >
      <Provider {...opts} />
    </DAppProvider>
  );
};

export default SlashAuthProvider;
