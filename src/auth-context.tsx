import React from 'react';
import {
  initialAuthState,
  initialMetamaskContext,
  SlashAuthState,
} from './auth-state';
import {
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  IdToken,
  LoginNoRedirectNoPopupOptions,
  LogoutOptions,
} from './global';
import { ObjectMap } from './utils/object';

export type SlashAuthStep = string;

export const SlashAuthStepNone: SlashAuthStep = 'NONE';
export const SlashAuthStepInitialized: SlashAuthStep = 'INITIALIZED';
export const SlashauthStepLoginFlowStarted: SlashAuthStep =
  'LOGIN_FLOW_STARTED';
export const SlashAuthStepFetchingNonce: SlashAuthStep = 'FETCHING_NONCE';
export const SlashAuthStepNonceReceived: SlashAuthStep = 'NONCE_RECEIVED';
export const SlashAuthStepLoggingInAwaitingAccount: SlashAuthStep =
  'AWAITING_ACCOUNT';
export const SlashAuthStepLoggingIn: SlashAuthStep = 'LOGGING_IN';
export const SlashAuthStepLoggedIn: SlashAuthStep = 'LOGGED_IN';

export interface SlashAuthContextInterface extends SlashAuthState {
  initialized: boolean;
  isTwoStep: boolean;
  isLoginReady: boolean;
  connect: (transparent: boolean) => Promise<string | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethereum: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  /*
   Gets a nonce to sign.
  */
  getNonceToSign: () => Promise<string | null>;

  hasRole: (roleName: string) => Promise<boolean>;
  hasOrgRole: (organizationID: string, roleName: string) => Promise<boolean>;
  getRoleMetadata: (roleName: string) => Promise<ObjectMap>;
  /*
    Gets an access token directly embedded in the page.
  */
  getAccessTokenSilently: (
    options?: GetTokenSilentlyOptions
  ) => Promise<string>;

  /*
    Logs the user in without a popup or redirect.

    Note that this is not very secure as anyone with access to a user's
    browser can overwrite an origin header on XHR requests causing
    a simple attack vector.
  */
  loginNoRedirectNoPopup: (
    options?: LoginNoRedirectNoPopupOptions
  ) => Promise<void>;

  /*
    Logs the user out.
  */
  logout: (options?: LogoutOptions) => Promise<void> | void;

  /*
    Logs the user in with a redirect. This is far more secure than the method
    above.

    Not currently implemented.
  */
  // loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;

  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  checkSession: (options?: GetTokenSilentlyOptions) => Promise<boolean>;
}

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <SlashAuthProvider>.');
};

const initialContextState: SlashAuthContextInterface = {
  ...initialAuthState,
  ...initialMetamaskContext,
  initialized: false,
  isTwoStep: false,
  isLoginReady: false,
  connect: stub,
  ethereum: null,
  hasRole: stub,
  hasOrgRole: stub,
  getRoleMetadata: stub,
  getNonceToSign: stub,
  getAccessTokenSilently: stub,
  loginNoRedirectNoPopup: stub,
  logout: stub,
  getIdTokenClaims: stub,
  checkSession: stub,
  provider: null,
};

const SlashAuthContext =
  React.createContext<SlashAuthContextInterface>(initialContextState);

export default SlashAuthContext;
