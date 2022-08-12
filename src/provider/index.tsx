import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import SlashAuthContext, {
  SlashAuthContextInterface,
  SlashAuthStepLoggingInAwaitingAccount,
  SlashauthStepLoginFlowStarted,
  SlashAuthStepNonceReceived,
  SlashAuthStepNone,
} from '../auth-context';
import { initialAuthState } from '../auth-state';
import SlashAuthClient from '../client';
import {
  CacheLocation,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  LoginNoRedirectNoPopupOptions,
  LogoutOptions,
  SlashAuthClientOptions,
} from '../global';
import { loginError } from '../utils';
import { reducer } from './reducer';
import { useWalletAuth } from './wallet-auth';
import { CoinbaseWalletSDKOptions } from '@coinbase/wallet-sdk/dist/CoinbaseWalletSDK';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { ObjectMap } from '../utils/object';
import isMobile from 'is-mobile';
import { useModalCore } from '../hooks/use-modal-core';
import {
  ACCOUNT_CONNECTED_EVENT,
  CONNECT_EVENT,
  eventEmitter,
  LOGIN_COMPLETE_EVENT,
  LOGIN_FAILURE_EVENT,
} from '../events';

export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ProviderOptions = {
  appName?: string;
  coinbasewallet?: CoinbaseWalletSDKOptions;
  walletconnect?: IWalletConnectProviderOptions;
  alchemy?: {
    apiKey: string;
  };
  infura?: {
    apiKey: string;
  };
  publicConf?: {
    disable: boolean;
  };
};

export let activeContextValue: SlashAuthContextInterface = null;

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
  const { children, skipRedirectCallback, ...clientOpts } = opts;
  const [client] = useState(
    () => new SlashAuthClient(toSlashAuthClientOptions(clientOpts))
  );
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const {
    appConfig,
    connectModal,
    wagmiConnector,
    handleDeactivate,
    setAppConfig,
  } = useModalCore(opts.providers);

  const { account, signer, provider, deactivate } = useWalletAuth();

  const getAppConfig = async () => {
    if (appConfig !== null) {
      return appConfig;
    }

    try {
      const conf = await client.getAppConfig();
      setAppConfig(conf);
    } catch (err) {
      console.error('Failed fetching app config');
      setAppConfig({
        modalStyle: {},
      });
    }
  };

  useEffect(() => {
    //wagmiConnector?.autoConnect().then((c) => c && checkSession());
    //checkSession().then((resp) => console.log(resp));
    checkSession();
    getAppConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectMobile = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return isMobile();
  };

  const connectAccount = useCallback(async () => {
    connectModal.setLoadingState();
    connectModal.showModal(() => {
      dispatch({
        type: 'ERROR',
        error: new Error('Login cancelled'),
      });
    });
    connectModal.setConnectWalletStep();

    return new Promise<string>((resolve, reject) => {
      eventEmitter.once(ACCOUNT_CONNECTED_EVENT, ({ account }) => {
        setTimeout(() => connectModal.hideModal(), 0);
        resolve(account);
      });
      eventEmitter.once(LOGIN_FAILURE_EVENT, () => {
        setTimeout(() => connectModal.hideModal(), 0);
        reject(new Error('Login failed or was rejected by the user'));
      });
    });
  }, [connectModal]);

  const getNonceToSign = useCallback(async () => {
    if (!account) {
      dispatch({
        type: 'ERROR',
        error: new Error('No account connected'),
      });
      return;
    }
    try {
      const nonceResp = await client.getNonceToSign({
        ...opts,
        address: account,
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

  const continueLoginWithSignedNonce = useCallback(async () => {
    if (!state.nonceToSign) {
      dispatch({ type: 'ERROR', error: new Error('No nonce to sign') });
      return;
    }
    dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_STARTED' });
    const signature = await signer.signMessage(state.nonceToSign);
    await client.loginNoRedirectNoPopup({
      ...(state.loginOptions || {}),
      address: account,
      signature,
    });

    dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE' });
  }, [account, client, signer, state.loginOptions, state.nonceToSign]);

  const loginWithSignedNonce = useCallback(
    async (loginIDFlow: number) => {
      if (state.loginFlowID !== loginIDFlow) {
        // We need to cancel this flow (TODO)
      }
      dispatch({ type: 'NONCE_REQUEST_STARTED' });
      connectModal.setSignNonceStep();
      try {
        let fetchedNonce = state.nonceToSign;
        if (!state.nonceToSign || state.nonceToSign.length === 0) {
          fetchedNonce = await getNonceToSign();
          dispatch({
            type: 'NONCE_RECEIVED',
            nonceToSign: fetchedNonce,
          });
          if (detectMobile()) {
            return;
          }
        } else {
          dispatch({
            type: 'NONCE_RECEIVED',
            nonceToSign: fetchedNonce,
          });
        }
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
      // dispatch({
      //   type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE',
      //   account: {
      //     address: account,
      //     network: Network.Ethereum,
      //   },
      // });
    },
    [connectModal, getNonceToSign, state.loginFlowID, state.nonceToSign]
  );

  const loginNoRedirectNoPopup = useCallback(
    async (options: LoginNoRedirectNoPopupOptions) => {
      const loginIDFlow = Date.now();
      dispatch({
        type: 'LOGIN_REQUESTED',
        loginType: 'LoginNoRedirectNoPopup',
        loginOptions: options,
        loginIDFlow,
      });
      connectModal.setLoadingState();
      connectModal.showModal(() => {
        dispatch({
          type: 'ERROR',
          error: new Error('Login cancelled'),
        });
      });
      if (!account) {
        connectModal.setConnectWalletStep();
        eventEmitter.once(CONNECT_EVENT, () => {
          dispatch({ type: 'AWAITING_ACCOUNT' });
        });
      } else {
        // In this case we are going to kick off the login flow immediately.
        dispatch({ type: 'LOGIN_FLOW_STARTED' });
      }

      return new Promise<void>((resolve, reject) => {
        eventEmitter.once(LOGIN_COMPLETE_EVENT, () => {
          setTimeout(() => connectModal.hideModal(), 0);
          resolve();
        });
        eventEmitter.once(LOGIN_FAILURE_EVENT, () => {
          setTimeout(() => connectModal.hideModal(), 0);
          reject(new Error('Login failed or was rejected by the user'));
        });
      });
    },
    [account, connectModal]
  );

  useEffect(() => {
    if (state.step === SlashAuthStepLoggingInAwaitingAccount && account) {
      dispatch({ type: 'LOGIN_FLOW_STARTED' });
    } else if (state.step === SlashauthStepLoginFlowStarted && account) {
      loginWithSignedNonce(state.loginFlowID);
    } else if (state.step === SlashAuthStepNonceReceived) {
      continueLoginWithSignedNonce();
    }
  }, [
    account,
    continueLoginWithSignedNonce,
    loginWithSignedNonce,
    state.loginFlowID,
    state.step,
  ]);

  const logout = useCallback(
    async (opts: LogoutOptions = {}): Promise<void> => {
      const maybePromise = client.logout(opts);
      deactivate();
      handleDeactivate();
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

  const hasOrgRole = useCallback(
    async (organizationID: string, roleName: string): Promise<boolean> => {
      return client.hasOrgRole(organizationID, roleName);
    },
    [client]
  );

  const getRoleMetadata = useCallback(
    async (roleName: string): Promise<ObjectMap> => {
      return client.getRoleMetadata(roleName);
    },
    [client]
  );

  const getAccessTokenSilently = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (opts?: GetTokenSilentlyOptions): Promise<any> => {
      let token: string | null = null;
      try {
        token = await client.getTokenSilently(opts);
      } catch (error) {
        console.error('error: ', error);
        return null;
      } finally {
        dispatch({
          type: 'INITIALIZED',
          account: await client.getAccount(),
          isAuthenticated: !!token,
        });
      }
      return token;
    },
    [client]
  );

  const checkSession = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (opts?: GetTokenSilentlyOptions): Promise<any> => {
      let isAuthenticated = false;
      try {
        dispatch({
          type: 'CHECKING_SESSION',
        });
        isAuthenticated = await client.checkSession(opts);
      } catch (error) {
        console.error('error: ', error);
        isAuthenticated = false;
      } finally {
        dispatch({
          isAuthenticated,
          type: 'INITIALIZED',
          account: await client.getAccount(),
        });
      }
      return isAuthenticated;
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
          isAuthenticated: false,
        });
        if (transparent) {
          return wagmiConnector.autoConnect();
        } else {
          return await connectAccount();
        }
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [client, connectAccount, wagmiConnector]
  );

  const contextValue = useMemo(() => {
    activeContextValue = {
      ...state,
      isTwoStep: detectMobile(),
      provider,
      connectedWallet: account,
      connect,
      ethereum: provider,
      hasRole,
      hasOrgRole,
      getRoleMetadata,
      getAccessTokenSilently,
      getNonceToSign,
      loginNoRedirectNoPopup,
      getIdTokenClaims,
      logout,
      checkSession,
      initialized: state.step !== SlashAuthStepNone,
      isLoginReady:
        detectMobile() && state.nonceToSign && state.step !== 'LOGGED_IN',
    };
    return activeContextValue;
  }, [
    state,
    provider,
    account,
    connect,
    hasRole,
    hasOrgRole,
    getRoleMetadata,
    getAccessTokenSilently,
    getNonceToSign,
    loginNoRedirectNoPopup,
    getIdTokenClaims,
    logout,
    checkSession,
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
