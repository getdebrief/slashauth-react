import { Account, LoginNoRedirectNoPopupOptions } from './global';
import { SlashAuthStep, SlashAuthStepNone } from './auth-context';

export type SlashAuthState = {
  step: SlashAuthStep;
  nonceToSign: string | null;
  error?: Error;
  isAuthenticated: boolean;
  isLoading: boolean;
  account?: Account;
  connectedWallet: string | null;
  isLoggingIn: boolean;
  loginRequested: boolean;
  loginOptions: LoginNoRedirectNoPopupOptions | null;
  loginType: 'LoginNoRedirectNoPopup' | null;
};

export const initialAuthState: SlashAuthState = {
  loginRequested: false,
  loginOptions: null,
  loginType: null,
  step: SlashAuthStepNone,
  nonceToSign: null,
  isAuthenticated: false,
  isLoading: false,
  connectedWallet: null,
  isLoggingIn: false,
};

export const initialMetamaskContext = {
  connect: async () => [],
};
