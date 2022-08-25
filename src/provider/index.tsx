import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import SlashAuthContext, {
  SlashAuthContextInterface,
  SlashAuthStepCancel,
  SlashAuthStepInitialized,
  SlashAuthStepLoggingIn,
  SlashAuthStepLoggingInAwaitingAccount,
  SlashAuthStepLoggingInInformationRequired,
  SlashAuthStepLoggingInInformationSubmitted,
  SlashAuthStepLoggingInMoreInformationComplete,
  SlashauthStepLoginFlowStarted,
  SlashAuthStepNonceReceived,
} from '../auth-context';
import { initialAuthState } from '../auth-state';
import SlashAuthClient from '../client';
import {
  CacheLocation,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  LogoutOptions,
  SlashAuthClientOptions,
  TokenTypeInformationRequiredToken,
} from '../global';
import { loginError } from '../utils';
import { reducer } from './reducer';
import { CoinbaseWalletSDKOptions } from '@coinbase/wallet-sdk/dist/CoinbaseWalletSDK';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { ObjectMap } from '../utils/object';
import isMobile from 'is-mobile';
import { useModalCore } from '../hooks/use-modal-core';
import {
  ACCOUNT_CONNECTED_EVENT,
  ADDITIONAL_INFO_SUBMIT_EVENT,
  eventEmitter,
  IFRAME_LOGIN_WITH_SIGNED_NONCE_RESPONSE,
  IFRAME_NONCE_RECEIVED,
  LOGIN_COMPLETE_EVENT,
  LOGIN_FAILURE_EVENT,
} from '../events';
import { useIframe } from '../hooks/use-login-iframe';
import getDeviceID from '../device';
import { createCodeVerifier } from '../utils/challenge';

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
    domain: domain || 'https://api.slashauth.com',
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
    initialized: iframeInitialized,
    mountIframe,
    unmountIframe,
    sendGetNonceMessage,
    sendLoginWithSignedNonceMessage,
  } = useIframe();

  const {
    appConfig,
    connectModal,
    walletAddress,
    provider,
    signer,
    wagmiConnector,
    setAppConfig,
  } = useModalCore(opts.providers);

  const getAppConfig = async () => {
    if (appConfig !== null) {
      return appConfig;
    }

    try {
      const conf = await client.getAppConfig();
      setAppConfig(conf);
    } catch (err) {
      // TODO: We should show an error message here? Maybe?
      console.error('Failed fetching app config', err);
      setAppConfig({
        modalStyle: {},
      });
    }
  };

  useEffect(() => {
    checkSession().then();
    getAppConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectMobile = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return isMobile();
  };

  const connectAccount = useCallback(
    async (keepModalOpen?: boolean) => {
      // connectModal.setLoadingState();
      // connectModal.showModal(() => {
      //   dispatch({
      //     type: 'CANCEL',
      //   });
      // });
      // connectModal.setConnectWalletStep();

      const loginIDFlow = Date.now();
      // Make sure the cache is clear for the user
      await client.logout({
        localOnly: true,
      });
      dispatch({
        type: 'LOGIN_REQUESTED',
        loginType: 'LoginNoRedirectNoPopup',
        loginOptions: null,
        loginIDFlow,
      });
      connectModal.setLoadingState();
      connectModal.showModal(() => {
        dispatch({
          type: 'CANCEL',
        });
      });

      const acc = await client.getAccount();
      if (!acc || !walletAddress) {
        wagmiConnector.clearState();
        connectModal.setConnectWalletStep();
      } else {
        // Return early if the account is already connected!
        if (!keepModalOpen) {
          setTimeout(() => connectModal.hideModal(), 0);
        }
        return Promise.resolve(acc.sub);
      }

      return new Promise<string>((resolve, reject) => {
        eventEmitter.once(ACCOUNT_CONNECTED_EVENT, ({ account }) => {
          console.log('in the response and ', {
            account,
            keepModalOpen,
          });
          if (!keepModalOpen) {
            setTimeout(() => connectModal.hideModal(), 0);
          }
          resolve(account);
        });
        eventEmitter.once(LOGIN_FAILURE_EVENT, () => {
          wagmiConnector.clearState();
          setTimeout(() => connectModal.hideModal(), 0);
          reject(new Error('Login failed or was rejected by the user'));
        });
      });
    },
    [walletAddress, client, connectModal, wagmiConnector]
  );

  const getNonceToSign = useCallback(async () => {
    if (!walletAddress) {
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
        address: walletAddress,
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
  }, [walletAddress, client, opts]);

  const continueLoginWithSignedNonce = useCallback(async () => {
    if (!state.nonceToSign) {
      dispatch({ type: 'ERROR', error: new Error('No nonce to sign') });
      return;
    }
    connectModal.setSignNonceStep();
    dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_STARTED' });
    try {
      // const signature = await signer.signMessage(state.nonceToSign);
      // connectModal.setLoadingState();
      // await client.loginNoRedirectNoPopup({
      //   ...(state.loginOptions || {}),
      //   address: walletAddress,
      //   signature,
      // });

      // const clientAccount = await client.getAccount();
      // if (
      //   clientAccount &&
      //   clientAccount['type'] === TokenTypeInformationRequiredToken
      // ) {
      //   // We need to get more information from the user.
      //   dispatch({
      //     type: 'MORE_INFORMATION_REQUIRED',
      //     requirements: clientAccount['requirements'],
      //   });
      // } else {
      //   dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE' });
      // }
      const signature = await signer.signMessage(state.nonceToSign);
      connectModal.setLoadingState();
      eventEmitter.once(
        IFRAME_LOGIN_WITH_SIGNED_NONCE_RESPONSE,
        ({
          address,
          error,
          success,
        }: {
          address?: string;
          success: boolean;
          error?: Error;
        }) => {
          console.log('response: ', {
            address,
            error,
            success,
          });
          // TODO: Verify that address === walletAddress
          if (success) {
            // This successfully fetched the nonce!
            dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE' });
          } else {
            dispatch({
              type: 'ERROR',
              error: error || new Error('Login Failed'),
            });
          }
        }
      );
      sendLoginWithSignedNonceMessage(walletAddress, getDeviceID(), signature);
    } catch (error) {
      if (error && error['code'] === 4001) {
        // This is a metamask error where the user cancelled signing
        dispatch({ type: 'CANCEL' });
      } else {
        console.error(error);
        dispatch({ type: 'ERROR', error });
      }
    }
  }, [
    connectModal,
    sendLoginWithSignedNonceMessage,
    signer,
    state.nonceToSign,
    walletAddress,
  ]);

  const informationRequiredLogin = useCallback(async () => {
    if (!state.requirements) {
      dispatch({ type: 'ERROR', error: new Error('No requirements') });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    connectModal.setAdditionalInfoStep(state.requirements, () => {});
    return new Promise<void>((resolve) => {
      eventEmitter.once(
        ADDITIONAL_INFO_SUBMIT_EVENT,
        (input: { email?: string; nickname?: string }) => {
          // If the user is submitting the data, let's continue submitting!
          connectModal.setLoadingState();
          dispatch({ type: 'MORE_INFORMATION_SUBMITTED', info: { ...input } });
          resolve();
        }
      );
    });
  }, [connectModal, state.requirements]);

  const handleInformationSubmitted = useCallback(async () => {
    if (!state.additionalInfo) {
      dispatch({ type: 'ERROR', error: new Error('No info') });
      return;
    }
    // TODO: Validate additional info
    try {
      await client.exchangeToken({
        address: walletAddress,
        requirements: state.additionalInfo,
      });
      dispatch({ type: 'MORE_INFORMATION_SUBMITTED_COMPLETE' });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'ERROR',
        error,
      });
    }
  }, [walletAddress, client, state.additionalInfo]);

  const loginWithSignedNonce = useCallback(
    async (loginIDFlow: number) => {
      if (state.loginFlowID !== loginIDFlow) {
        // We need to cancel this flow (TODO)
      }
      connectModal.setLoadingState();
      try {
        // let fetchedNonce = state.nonceToSign;
        // if (!state.nonceToSign || state.nonceToSign.length === 0) {
        //   fetchedNonce = await getNonceToSign();
        //   if (!fetchedNonce) {
        //     dispatch({
        //       type: 'ERROR',
        //       error: new Error('No nonce retrieved'),
        //     });
        //     return;
        //   }
        //   if (detectMobile()) {
        //     connectModal.hideModal();
        //     return;
        //   }
        // } else {
        //   dispatch({
        //     type: 'NONCE_RECEIVED',
        //     nonceToSign: fetchedNonce,
        //   });
        // }
        await new Promise((resolve, reject) => {
          eventEmitter.once(
            IFRAME_NONCE_RECEIVED,
            ({
              address,
              nonce,
              error,
              success,
            }: {
              address?: string;
              nonce?: string;
              success: boolean;
              error?: Error;
            }) => {
              // TODO: Verify that address === walletAddress
              if (success) {
                // This successfully fetched the nonce!
                dispatch({
                  type: 'NONCE_RECEIVED',
                  nonceToSign: nonce,
                });
                if (detectMobile()) {
                  connectModal.hideModal();
                }
              } else {
                dispatch({
                  type: 'ERROR',
                  error: error || new Error('No Nonce retrieved'),
                });
              }
            }
          );
          sendGetNonceMessage(walletAddress, getDeviceID());
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
    },
    [connectModal, sendGetNonceMessage, state.loginFlowID, walletAddress]
  );

  const loginNoRedirectNoPopup = useCallback(
    async (options?: Record<string, unknown>) => {
      if (walletAddress && state.step === SlashAuthStepNonceReceived) {
        // The nonce has been received. We will continue
        // the flow.
        connectModal.setLoadingState();
        connectModal.showModal(() => {
          dispatch({
            type: 'CANCEL',
          });
        });
        continueLoginWithSignedNonce();
      } else {
        dispatch({ type: 'AWAITING_ACCOUNT' });
        // No need to await here.
        connectAccount(true);
      }

      return new Promise<void>((resolve, reject) => {
        eventEmitter.once(LOGIN_COMPLETE_EVENT, () => {
          setTimeout(() => connectModal.hideModal(), 0);
          resolve();
        });
        eventEmitter.once(
          LOGIN_FAILURE_EVENT,
          (input: { userCancel: boolean }) => {
            wagmiConnector.clearState();
            setTimeout(() => connectModal.hideModal(), 0);
            if (input.userCancel) {
              resolve();
            } else {
              reject(new Error('Login failed or was rejected by the user'));
            }
          }
        );
      });
    },
    [
      walletAddress,
      connectAccount,
      connectModal,
      continueLoginWithSignedNonce,
      state,
      wagmiConnector,
    ]
  );

  useEffect(() => {
    if (state.step === SlashAuthStepLoggingInAwaitingAccount && walletAddress) {
      dispatch({ type: 'LOGIN_FLOW_STARTED' });
    } else if (state.step === SlashauthStepLoginFlowStarted && walletAddress) {
      // Mount iframe
      createCodeVerifier().then((verifier) => {
        dispatch({
          type: 'CODE_VERIFIER_CREATED',
          codeVerifier: verifier,
        });
        mountIframe(
          `http://localhost:8080/oidc/auth?client_id=${opts.clientID}&redirect_uri=http://localhost:3000&response_type=code&code_challenge=${verifier.challenge}&code_challenge_method=${verifier.method}&state=123&hiddenIframe=true&response_mode=web_message`
        );
        setTimeout(() => loginWithSignedNonce(state.loginFlowID), 2000);
      });
    } else if (state.step === SlashAuthStepNonceReceived) {
      // We stop the login flow when the user is mobile.
      if (!detectMobile()) {
        continueLoginWithSignedNonce();
      }
    } else if (state.step === SlashAuthStepLoggingInInformationRequired) {
      informationRequiredLogin();
    } else if (state.step === SlashAuthStepLoggingInInformationSubmitted) {
      handleInformationSubmitted();
    } else if (state.step === SlashAuthStepLoggingInMoreInformationComplete) {
      dispatch({ type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE' });
    } else if (state.step === SlashAuthStepCancel) {
      wagmiConnector?.disconnect();
      dispatch({ type: 'RESET' });
    }
  }, [
    walletAddress,
    continueLoginWithSignedNonce,
    handleInformationSubmitted,
    informationRequiredLogin,
    loginWithSignedNonce,
    state.loginFlowID,
    state.step,
    wagmiConnector,
    mountIframe,
    opts.clientID,
    sendGetNonceMessage,
  ]);

  const logout = useCallback(
    async (opts: LogoutOptions = {}): Promise<void> => {
      const maybePromise = client.logout(opts);
      await wagmiConnector?.disconnect();
      dispatch({ type: 'LOGOUT' });
      return maybePromise;
    },
    [client, wagmiConnector]
  );

  /**
   * Function to logout a user when they switch wallets
   */
  useEffect(() => {
    if (
      state.account?.sub &&
      walletAddress &&
      state.account.sub.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      logout();
    }
  }, [logout, state.account?.sub, walletAddress]);

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
        const account = await client.getAccount();
        dispatch({
          type: 'INITIALIZED',
          account: account,
          isAuthenticated: account && account['type'] === 'access_token',
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
        const account = await client.getAccount();
        dispatch({
          type: 'INITIALIZED',
          account,
          isAuthenticated: account && account['type'] === 'access_token',
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
        const account = await client.getAccount();
        dispatch({
          type: 'INITIALIZED',
          account,
          isAuthenticated: account && account['type'] === 'access_token',
        });
        if (transparent) {
          return wagmiConnector.autoConnect();
        } else {
          await connectAccount(false);
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [client, connectAccount, wagmiConnector]
  );

  useEffect(() => {
    if (
      detectMobile() &&
      walletAddress &&
      !state.nonceToSign &&
      (state.step === SlashAuthStepInitialized ||
        state.step === SlashAuthStepLoggingIn)
    ) {
      getNonceToSign();
    }
  }, [walletAddress, getNonceToSign, state.nonceToSign, state.step]);

  const contextValue = useMemo(() => {
    activeContextValue = {
      ...state,
      isTwoStep: detectMobile(),
      provider,
      authedWallet: state.account?.sub || null,
      connectedWallet: walletAddress,
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
      isLoginReady:
        detectMobile() && state.nonceToSign && state.step !== 'LOGGED_IN',
    };
    return activeContextValue;
  }, [
    state,
    provider,
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
    walletAddress,
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
