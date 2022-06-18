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
import { CoinbaseWalletSDKOptions } from '@coinbase/wallet-sdk/dist/CoinbaseWalletSDK';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { isMobile } from 'web3modal';

export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ProviderOptions = {
  coinbasewallet?: CoinbaseWalletSDKOptions;
  walletconnect?: IWalletConnectProviderOptions;
};

/**
 * The main configuration to instantiate the `SlashAuthProvider`.
 */
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
   */
  cache?: ICache;
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
    account,
    library,
    connectOnStart,
    connectWallet,
    active,
    provider,
    deactivate,
  } = useWalletAuth(opts.providers);

  useEffect(() => {
    if (connectOnStart && !active) {
      connectWallet(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectOnStart]);

  const detectMobile = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return isMobile();
  };

  const connectAccount = useCallback(async () => {
    const acc = await connectWallet(false);
    if (acc && state.loginRequested) {
      dispatch({
        type: 'ACCOUNT_CONNECTED',
        account: {
          address: acc,
          network: Network.Ethereum,
        },
      });
    }
    return acc;
  }, [connectWallet, state.loginRequested]);

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
          if (detectMobile()) {
            return;
          }
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
      state.nonceToSign,
    ]
  );

  useEffect(() => {
    if (
      state.loginRequested &&
      account &&
      !detectMobile() &&
      state.step !== 'NONCE_REQUEST_STARTED'
    ) {
      dispatch({ type: 'LOGIN_REQUEST_FULFILLED' });
      // We should check to ensure it's login no redirect no popup type.
      loginNoRedirectNoPopup(state.loginOptions);
    }
  }, [
    loginNoRedirectNoPopup,
    state.loginOptions,
    state.loginRequested,
    account,
    state.step,
  ]);

  useEffect(() => {
    if (
      detectMobile() &&
      account &&
      !state.nonceToSign &&
      state.step !== 'FETCHING_NONCE'
    ) {
      getNonceToSign();
    }
  }, [account, getNonceToSign, state.nonceToSign, state.step]);

  const logout = useCallback(
    async (opts: LogoutOptions = {}): Promise<void> => {
      const maybePromise = client.logout(opts);
      deactivate();
      dispatch({ type: 'LOGOUT' });
      return maybePromise;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client]
  );

  const hasRole = useCallback(
    async (roleName: string): Promise<boolean> => {
      return client.hasRole(roleName);
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

  const connect = useCallback(
    async (transparent?: boolean) => {
      try {
        dispatch({
          type: 'INITIALIZED',
          account: await client.getAccount(),
        });
        const account = await connectWallet(transparent);
        return account;
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setInitialized(true), 250);
      }
    },
    [connectWallet, client]
  );

  const contextValue = useMemo(() => {
    return {
      ...state,
      isTwoStep: detectMobile(),
      provider,
      connectedWallet: account,
      connect,
      ethereum: library,
      hasRole,
      getAccessTokenSilently,
      getNonceToSign,
      loginNoRedirectNoPopup,
      getIdTokenClaims,
      logout,
      checkSession,
      initialized,
      isLoginReady:
        detectMobile() && state.nonceToSign && state.step !== 'LOGGED_IN',
    };
  }, [
    state,
    provider,
    account,
    connect,
    library,
    hasRole,
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
 *   clientId={clientId}
 *   providers={{...}}
 * >
 *   <MyApp />
 * </SlashAuthProvider>
 * ```
 *
 */
const SlashAuthProvider = (opts: SlashAuthProviderOptions): JSX.Element => {
  return <Provider {...opts} />;
};

export default SlashAuthProvider;
