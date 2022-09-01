import { Account, LoginNoRedirectNoPopupOptions } from './global';
import { SlashAuthStep, SlashAuthStepNone } from './auth-context';
import { CodeVerifier } from './utils/challenge';

export type SlashAuthState = {
  loginFlowID: number | null;
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
  requirements: string[] | null;
  additionalInfo: { email?: string; nickname?: string } | null;
  initialized: boolean;
  codeVerifier: CodeVerifier | null;
};

export const initialAuthState: SlashAuthState = {
  loginFlowID: null,
  loginRequested: false,
  loginOptions: null,
  loginType: null,
  step: SlashAuthStepNone,
  nonceToSign: null,
  isAuthenticated: false,
  isLoading: false,
  connectedWallet: null,
  isLoggingIn: false,
  requirements: null,
  additionalInfo: null,
  initialized: false,
  codeVerifier: null,
};

export const initialMetamaskContext = {
  connect: async () => [],
  ethereum: null,
};
