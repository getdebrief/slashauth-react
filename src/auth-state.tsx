import { Account } from './global';
import { SlashAuthStep, SlashAuthStepNone } from './auth-context';

export type SlashAuthState = {
  step: SlashAuthStep;
  nonceToSign: string | null;
  error?: Error;
  isAuthenticated: boolean;
  isLoading: boolean;
  account?: Account;
  connectedWallet: string | null;
};

export const initialAuthState: SlashAuthState = {
  step: SlashAuthStepNone,
  nonceToSign: null,
  isAuthenticated: false,
  isLoading: true,
  connectedWallet: null,
};

export const initialMetamaskContext = {
  connect: async () => [],
  ethereum: null,
};
