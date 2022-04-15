import { Account } from '@navvi/slashauth-react-client';
import {
  SlashAuthStepFetchingNonce,
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
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; error: Error };

/**
 * Handles how that state changes in the `useAuth0` hook.
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
      };
    case 'LOGIN_WITH_SIGNED_NONCE_COMPLETE':
    case 'INITIALIZED':
      return {
        ...state,
        isAuthenticated: !!action.account,
        account: action.account,
        isLoading: false,
        error: undefined,
        nonceToSign: null,
        step: SlashAuthStepLoggedIn,
      };
    case 'NONCE_RECEIVED':
      return {
        ...state,
        nonceToSign: action.nonceToSign,
        step: SlashAuthStepNonceReceived,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        account: undefined,
        step: SlashAuthStepNone,
      };
    case 'ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
        nonceToSign: null,
        step: SlashAuthStepNone,
      };
  }
};
