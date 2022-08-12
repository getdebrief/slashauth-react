import { Account, LoginNoRedirectNoPopupOptions } from '../global';
import {
  SlashAuthStepFetchingNonce,
  SlashAuthStepInitialized,
  SlashAuthStepLoggedIn,
  SlashAuthStepLoggingIn,
  SlashAuthStepLoggingInAwaitingAccount,
  SlashauthStepLoginFlowStarted,
  SlashAuthStepNonceReceived,
  SlashAuthStepNone,
} from '../auth-context';
import { SlashAuthState } from '../auth-state';
import {
  eventEmitter,
  LOGIN_COMPLETE_EVENT,
  LOGIN_FAILURE_EVENT,
} from '../events';

type Action =
  | { type: 'CHECKING_SESSION' }
  | { type: 'LOGIN_FLOW_STARTED' }
  | { type: 'INITIALIZED'; account?: Account; isAuthenticated: boolean }
  | { type: 'AWAITING_ACCOUNT' }
  | {
      type:
        | 'NONCE_REQUEST_STARTED'
        | 'NONCE_RECEIVED'
        | 'LOGIN_WITH_SIGNED_NONCE_STARTED'
        | 'LOGIN_WITH_SIGNED_NONCE_COMPLETE';
      account?: Account;
      nonceToSign?: string | null;
    }
  | { type: 'ACCOUNT_CONNECTED'; account: Account }
  | { type: 'LOGIN_REQUEST_FULFILLED' }
  | {
      type: 'LOGIN_REQUESTED';
      loginOptions: LoginNoRedirectNoPopupOptions | null;
      loginType: 'LoginNoRedirectNoPopup' | null;
      loginIDFlow: number | null;
    }
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; error: Error };

/**
 * Handles how that state changes in the `/auth` hook.
 */
export const reducer = (
  state: SlashAuthState,
  action: Action
): SlashAuthState => {
  switch (action.type) {
    case 'CHECKING_SESSION':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_FLOW_STARTED':
      return {
        ...state,
        step: SlashauthStepLoginFlowStarted,
        isLoading: true,
        isLoggingIn: true,
      };
    case 'LOGIN_WITH_SIGNED_NONCE_STARTED':
      return {
        ...state,
        step: SlashAuthStepLoggingIn,
      };
    case 'AWAITING_ACCOUNT':
      if (state.step === SlashAuthStepLoggingInAwaitingAccount) {
        return state;
      }
      return {
        ...state,
        step: SlashAuthStepLoggingInAwaitingAccount,
      };
    case 'NONCE_REQUEST_STARTED':
      // try {
      //   let fetchedNonce = state.nonceToSign;
      //   if (!state.nonceToSign || state.nonceToSign.length === 0) {
      //     fetchedNonce = await getNonceToSign();
      //     dispatch({
      //       type: 'NONCE_RECEIVED',
      //       nonceToSign: fetchedNonce,
      //     });
      //     if (detectMobile()) {
      //       // TODO: More to do here.
      //       return;
      //     }
      //   } else {
      //     dispatch({
      //       type: 'NONCE_RECEIVED',
      //       nonceToSign: fetchedNonce,
      //     });
      //   }
      // } catch (error) {
      //   let errorMessage = 'Unknown error';
      //   if (error instanceof Error) {
      //     errorMessage = error.message;
      //   }
      //   dispatch({
      //     type: 'ERROR',
      //     error: loginError({
      //       error: errorMessage,
      //     }),
      //   });
      //   return;
      // }
      // // const account = await client.getAccount({});
      // dispatch({
      //   type: 'LOGIN_WITH_SIGNED_NONCE_COMPLETE',
      //   account: {
      //     address: account,
      //     network: Network.Ethereum,
      //   },
      // });

      return {
        ...state,
        step:
          action.type === 'NONCE_REQUEST_STARTED' && state.nonceToSign
            ? SlashAuthStepFetchingNonce
            : SlashAuthStepLoggingIn,
        isLoading: true,
        isLoggingIn: true,
      };
    case 'LOGIN_REQUEST_FULFILLED':
      return {
        ...state,
        loginRequested: false,
        loginOptions: null,
        loginType: null,
      };
    case 'ACCOUNT_CONNECTED':
      return {
        ...state,
        account: action.account,
      };
    case 'LOGIN_REQUESTED':
      return {
        ...state,
        loginRequested: true,
        loginType: action.loginType,
        loginOptions: action.loginOptions,
        loginFlowID: action.loginIDFlow,
      };
    case 'INITIALIZED':
      return {
        ...state,
        isAuthenticated: action.isAuthenticated || false,
        account: action.account || null,
        isLoading: false,
        error: undefined,
        nonceToSign: null,
        step: SlashAuthStepInitialized,
        isLoggingIn: false,
      };
    case 'LOGIN_WITH_SIGNED_NONCE_COMPLETE':
      eventEmitter.emit(LOGIN_COMPLETE_EVENT);
      return {
        ...state,
        isAuthenticated: true,
        account: action.account,
        isLoading: false,
        error: undefined,
        nonceToSign: null,
        step: SlashAuthStepLoggedIn,
        isLoggingIn: false,
      };
    case 'NONCE_RECEIVED':
      return {
        ...state,
        nonceToSign: action.nonceToSign,
        step: SlashAuthStepNonceReceived,
        isLoggingIn: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        account: undefined,
        step: SlashAuthStepInitialized,
        isLoggingIn: false,
        isLoading: false,
        nonceToSign: null,
      };
    case 'ERROR':
      eventEmitter.emit(LOGIN_FAILURE_EVENT);
      return {
        ...state,
        loginRequested: false,
        isLoading: false,
        error: action.error,
        nonceToSign: null,
        step: SlashAuthStepNone,
        isLoggingIn: false,
        loginFlowID: null,
      };
  }
};
