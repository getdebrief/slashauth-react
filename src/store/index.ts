import vanillaStore from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  SlashAuthStep,
  SlashAuthStepCancel,
  SlashAuthStepFetchingNonce,
  SlashAuthStepInitialized,
  SlashAuthStepLoggedIn,
  SlashAuthStepLoggingInAwaitingAccount,
  SlashAuthStepLoggingInInformationRequired,
  SlashAuthStepLoggingInInformationSubmitted,
  SlashAuthStepLoggingInMoreInformationComplete,
  SlashAuthStepLoginFlowStarted,
  SlashAuthStepNonceReceived,
  SlashAuthStepNonceSigned,
  SlashAuthStepNone,
} from '../auth-context';
import { Account, LoginNoRedirectNoPopupOptions } from '../global';
import { produce } from 'immer';

type WalletState = {
  address: string | null;
  nonceToSign: string | null;
  signature: string | null;
};

const stub = (): never => {
  throw new Error('Not initialized');
};

export type LoginState = {
  loginFlowID: string | null;
  step: SlashAuthStep;
  walletLogin: WalletState;
  error?: Error;
  isAuthenticated: boolean;
  isLoading: boolean;
  account: Account | null;
  loginOptions: LoginNoRedirectNoPopupOptions | null;
  loginType: 'WALLET' | null;
  requirements: string[] | null;
  additionalInfo: { email?: string; nickname?: string } | null;
  initialized: boolean;
  modalShowing: boolean;
};

const initialLoginState: LoginState = {
  loginFlowID: null,
  step: SlashAuthStepNone,
  walletLogin: {
    address: null,
    nonceToSign: null,
    signature: null,
  },
  isAuthenticated: false,
  isLoading: false,
  account: null,
  loginOptions: null,
  loginType: null,
  requirements: null,
  additionalInfo: null,
  initialized: false,
  modalShowing: false,
};

type Store = {
  login: LoginState;

  reset: () => void;
  loading: (isLoading: boolean) => void;
  modalShowing: (showing: boolean) => void;
  initialized: ({
    isAuthenticated,
    account,
    address,
  }: {
    isAuthenticated: boolean;
    account: Account | null;
    address: string | null;
  }) => void;
  setLoginStep: (loginStep: SlashAuthStep) => void;
  loginComplete: ({
    account,
  }: {
    isAuthenticated: boolean;
    account: Account | null;
    address: string | null;
  }) => void;
  error: ({ error }: { error?: Error }) => void;
  setNonce: ({ nonce }: { nonce: string | null }) => void;
  signedNonce: ({ signature }: { signature: string }) => void;
  logout: () => void;
};

const loginStore = vanillaStore(
  subscribeWithSelector<Store>((set) => ({
    login: initialLoginState,
    reset: () =>
      set(
        produce((state: Store) => {
          state.login = initialLoginState;
          state.login.initialized = true;
        })
      ),
    // Actions
    modalShowing: (showing: boolean) =>
      set(produce((state: Store) => (state.login.modalShowing = showing))),
    loading: (isLoading: boolean) =>
      set(produce((state: Store) => (state.login.isLoading = isLoading))),
    initialized: ({
      isAuthenticated,
      account,
      address,
    }: {
      isAuthenticated: boolean;
      account: Account | null;
      address: string | null;
    }) =>
      set(
        produce((state: Store) => {
          state.login = {
            ...state.login,
            initialized: true,
            isAuthenticated,
            account,
            isLoading: false,
            error: undefined,
            walletLogin: {
              address,
              nonceToSign: null,
              signature: null,
            },
            step: SlashAuthStepInitialized,
          };
        })
      ),
    setLoginStep: (loginStep: SlashAuthStep) =>
      set(produce((state: Store) => (state.login.step = loginStep))),

    signedNonce: ({ signature }: { signature: string }) => {
      set(
        produce((state: Store) => {
          state.login.walletLogin.signature = signature;
          state.login.step = SlashAuthStepNonceSigned;
        })
      );
    },

    startLoginFlow: () =>
      set(
        produce((state: Store) => {
          state.login = {
            ...state.login,
            step: SlashAuthStepLoginFlowStarted,
            requirements: null,
            additionalInfo: null,
          };
        })
      ),
    awaitingAccount: () =>
      set(
        produce((state: Store) => {
          state.login.step = SlashAuthStepLoggingInAwaitingAccount;
        })
      ),
    startNonceRequest: () =>
      set(
        produce((state: Store) => {
          state.login.step = SlashAuthStepFetchingNonce;
        })
      ),
    loginRequestFulfilled: () =>
      set(
        produce((state: Store) => {
          state.login.step = SlashAuthStepFetchingNonce;
          state.login.loginType = null;
        })
      ),
    accountConnected: ({ address }: { address: string }) =>
      set(
        produce((state: Store) => {
          state.login.walletLogin.address = address;
        })
      ),
    loginRequested: ({
      loginType,
      loginOptions,
      loginFlowID,
    }: {
      loginType: 'WALLET';
      loginOptions: LoginNoRedirectNoPopupOptions;
      loginFlowID: string;
    }) =>
      set(
        produce((state: Store) => {
          state.login.loginType = loginType;
          state.login.loginOptions = loginOptions;
          state.login.loginFlowID = loginFlowID;
        })
      ),

    loginComplete: ({
      account,
    }: {
      isAuthenticated: boolean;
      account: Account | null;
      address: string | null;
    }) =>
      set(
        produce((state: Store) => {
          state.login = {
            ...state.login,
            isAuthenticated: true,
            account,
            isLoading: false,
            error: undefined,
            requirements: null,
            step: SlashAuthStepLoggedIn,
          };
        })
      ),
    setNonce: ({ nonce }: { nonce: string | null }) =>
      set(
        produce((state: Store) => {
          state.login.step = SlashAuthStepNonceReceived;
          state.login.walletLogin.nonceToSign = nonce;
        })
      ),
    logout: () =>
      set(
        produce((state: Store) => {
          state.login = {
            ...state.login,
            isAuthenticated: false,
            account: null,
            step: SlashAuthStepNone,
            isLoading: false,
            walletLogin: {
              nonceToSign: null,
              address: null,
              signature: null,
            },
            requirements: null,
            additionalInfo: null,
          };
        })
      ),
    cancel: () => {
      set(
        produce((state: Store) => {
          state.login = {
            ...state.login,
            account: null,
            isLoading: false,
            step: SlashAuthStepCancel,
            loginFlowID: null,
            requirements: null,
            additionalInfo: null,
          };
          state.login.walletLogin.nonceToSign = null;
        })
      );
    },
    error: ({ error }: { error?: Error }) =>
      set(
        produce((state: Store) => {
          state.login = {
            ...state.login,
            account: null,
            isLoading: false,
            error,
            step: SlashAuthStepCancel,
            loginFlowID: null,
            requirements: null,
            additionalInfo: null,
          };
          state.login.walletLogin.nonceToSign = null;
        })
      ),
    moreInformationRequired: ({ requirements }: { requirements: string[] }) =>
      set(
        produce((state: Store) => {
          state.login.requirements = requirements;
          state.login.step = SlashAuthStepLoggingInInformationRequired;
        })
      ),
    moreInformationSubmitted: ({
      info,
    }: {
      info: { email?: string; nickname?: string };
    }) =>
      set(
        produce((state: Store) => {
          state.login.additionalInfo = info;
          state.login.step = SlashAuthStepLoggingInInformationSubmitted;
        })
      ),
    moreInformationComplete: () =>
      set(
        produce((state: Store) => {
          state.login.step = SlashAuthStepLoggingInMoreInformationComplete;
        })
      ),
  }))
);

export { loginStore };
