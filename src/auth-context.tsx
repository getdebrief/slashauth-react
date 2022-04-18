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
  LogoutUrlOptions,
} from './global';

export type SlashAuthStep = string;

export const SlashAuthStepNone: SlashAuthStep = 'NONE';
export const SlashAuthStepFetchingNonce: SlashAuthStep = 'FETCHING_NONCE';
export const SlashAuthStepNonceReceived: SlashAuthStep = 'NONCE_RECEIVED';
export const SlashAuthStepLoggingIn: SlashAuthStep = 'LOGGING_IN';
export const SlashAuthStepLoggedIn: SlashAuthStep = 'LOGGED_IN';

export interface SlashAuthContextInterface extends SlashAuthState {
  connect: () => Promise<string[] | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethereum: any;
  /*
   Gets a nonce to sign.
  */
  getNonceToSign: () => Promise<string | null>;
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
    Builds the logout URL
  */
  buildLogoutUrl: (options?: LogoutUrlOptions) => string;

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
}

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <SlashAuthProvider>.');
};

const initialContextState: SlashAuthContextInterface = {
  ...initialAuthState,
  ...initialMetamaskContext,
  connect: stub,
  ethereum: null,
  getNonceToSign: stub,
  getAccessTokenSilently: stub,
  loginNoRedirectNoPopup: stub,
  buildLogoutUrl: stub,
  logout: stub,
  getIdTokenClaims: stub,
};

const SlashAuthContext =
  React.createContext<SlashAuthContextInterface>(initialContextState);

export default SlashAuthContext;
