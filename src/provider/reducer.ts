import { Account, LoginNoRedirectNoPopupOptions } from '../global';
import {
  SlashAuthStepFetchingNonce,
  SlashAuthStepInitialized,
  SlashAuthStepLoggedIn,
  SlashAuthStepLoggingIn,
  SlashAuthStepNonceReceived,
  SlashAuthStepNone,
} from '../auth-context';
import { SlashAuthState } from '../auth-state';

type Action =
  | { type: 'LOGIN_FLOW_STARTED' }
  | {
      type:
        | 'INITIALIZED'
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
    case 'LOGIN_FLOW_STARTED':
    case 'LOGIN_WITH_SIGNED_NONCE_STARTED':
    case 'NONCE_REQUEST_STARTED':
      return {
        ...state,
        step:
          action.type === 'NONCE_REQUEST_STARTED'
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
      };
    case 'INITIALIZED':
      return {
        ...state,
        isAuthenticated: !!action.account,
        isLoading: false,
        error: undefined,
        nonceToSign: null,
        step: SlashAuthStepInitialized,
        isLoggingIn: false,
      };
    case 'LOGIN_WITH_SIGNED_NONCE_COMPLETE':
      return {
        ...state,
        isAuthenticated: !!action.account,
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
        isLoading: false,
        isLoggingIn: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        account: undefined,
        step: SlashAuthStepInitialized,
        isLoggingIn: false,
        isLoading: false,
      };
    case 'ERROR':
      return {
        ...state,
        loginRequested: false,
        isLoading: false,
        error: action.error,
        nonceToSign: null,
        step: SlashAuthStepNone,
        isLoggingIn: false,
      };
  }
};
