import React, { useCallback, useMemo, useReducer, useState } from 'react';
import SlashAuthContext from '../auth-context';
import { initialAuthState } from '../auth-state';
import {
  ICache,
  SlashAuthClient,
  CacheLocation,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  LoginNoRedirectNoPopupOptions,
  LogoutOptions,
  LogoutUrlOptions,
  SlashAuthClientOptions,
} from '@navvi/slashauth-react-client';
import { loginError, tokenError } from '../utils';
import { reducer } from './reducer';
import { useMetaMask, MetaMaskProvider } from '@navvi/react-use-metamask';

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
  domain: string;
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
   * Read more about [changing storage options in the Auth0 docs](https://auth0.com/docs/libraries/auth0-single-page-app-sdk#change-storage-options)
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
  const { clientID, redirectUri, ...validOpts } = opts;
  return {
    ...validOpts,
    clientID: clientID,
    slashAuthClient: {
      name: 'slashAuth-react',
      version: '',
    },
  };
};

const Provider = (opts: SlashAuthProviderOptions): JSX.Element => {
  const { children, skipRedirectCallback, ...clientOpts } = opts;
  const [client] = useState(
    () => new SlashAuthClient(toSlashAuthClientOptions(clientOpts))
  );
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const metamaskProvider = useMetaMask();

  const buildLogoutUrl = useCallback(
    (opts?: LogoutUrlOptions): string => client.buildLogoutUrl(opts),
    [client]
  );

  const getNonceToSign = useCallback(async () => {
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
  }, [client, metamaskProvider.account, opts]);

  const loginNoRedirectNoPopup = useCallback(
    async (options: LoginNoRedirectNoPopupOptions) => {
      dispatch({ type: 'LOGIN_FLOW_STARTED' });
      try {
        await metamaskProvider.connect();
        const signature = await metamaskProvider.ethereum?.request({
          method: 'personal_sign',
          params: [state.nonceToSign, metamaskProvider.account],
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
      const account = await client.getAccount();
      dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE', account });
    },
    [client, metamaskProvider, state.nonceToSign]
  );

  const logout = useCallback(
    (opts: LogoutOptions = {}): Promise<void> | void => {
      const maybePromise = client.logout(opts);
      if (opts.localOnly) {
        if (maybePromise && typeof maybePromise.then === 'function') {
          return maybePromise.then(() => dispatch({ type: 'LOGOUT' }));
        }
        dispatch({ type: 'LOGOUT' });
      }
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

  const getIdTokenClaims = useCallback(
    (opts: GetIdTokenClaimsOptions) => client.getIdTokenClaims(opts),
    [client]
  );

  const contextValue = useMemo(() => {
    return {
      ...state,
      connectedWallet: metamaskProvider.account,
      connect: metamaskProvider.connect,
      ethereum: metamaskProvider.ethereum,
      buildLogoutUrl,
      getAccessTokenSilently,
      getNonceToSign,
      loginNoRedirectNoPopup,
      getIdTokenClaims,
      logout,
    };
  }, [
    state,
    metamaskProvider,
    buildLogoutUrl,
    getAccessTokenSilently,
    getNonceToSign,
    loginNoRedirectNoPopup,
    getIdTokenClaims,
    logout,
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
