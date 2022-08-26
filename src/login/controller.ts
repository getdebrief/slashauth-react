import {
  SlashAuthStepActivated,
  SlashAuthStepCancel,
  SlashAuthStepConnectingWallet,
  SlashAuthStepInitialized,
  SlashAuthStepNonceSigned,
  SlashAuthStepNone,
  SlashAuthStepSignNonce,
  SlashAuthStepWalletConnected,
} from '../auth-context';
import SlashAuthClient from '../client';
import { eventEmitter, SIGN_NONCE_EVENT } from '../events';
import { loginStore } from '../store';
import { loginError } from '../utils';

export class LoginController {
  constructor(private client: SlashAuthClient) {}

  public login() {
    loginStore.getState().setLoginStep(SlashAuthStepActivated);
  }

  public listen() {
    loginStore.subscribe(
      ({ login, ...others }) => ({ ...login, actions: { ...others } }),
      (state, prevState) => {
        if (state.step !== prevState.step) {
          switch (state.step) {
            case SlashAuthStepNone:
              // Not sure what to do here -- we have transitioned into the none state.
              // Potentially we want to clear all login sessions?
              break;
            case SlashAuthStepCancel:
              // The state has gone into a cancellation state. Nothing to be done here.
              break;
            case SlashAuthStepInitialized:
              // The state is now initialized and is ready to go
              state.actions.loading(false);
              break;
            case SlashAuthStepActivated:
              state.actions.modalShowing(true);
              state.actions.setLoginStep(SlashAuthStepConnectingWallet);
              break;
            case SlashAuthStepConnectingWallet:
              if (!state.modalShowing) {
                state.actions.modalShowing(true);
              }
              if (state.walletLogin.address) {
                // The wallet is connected. We can move on to a signature.
                state.actions.setLoginStep(SlashAuthStepWalletConnected);
              }
              break;
            case SlashAuthStepWalletConnected:
              // The wallet is connected. We will make a request to the auth endpoint
              // One of two things will happen:
              // 1. The endpoint will return a login flow which will force us to sign something.
              // 2. The endpoint will silently authenticate the user and proceed with authorization logic.
              this.client
                .getNonceToSign({ address: state.walletLogin.address })
                .then((nonce) => state.actions.setNonce({ nonce }))
                .catch((err) => {
                  state.actions.error({ error: loginError(err) });
                });
              break;
            case SlashAuthStepSignNonce:
              // TODO: Validate the state for signing nonce.
              state.actions.loading(true);
              eventEmitter.emit(SIGN_NONCE_EVENT, {
                nonce: state.walletLogin.nonceToSign,
              });
              break;
            case SlashAuthStepNonceSigned:
              // We want to authenticate now -- there's a possibility the user is already authenticated so let's force it.
              this.client
                .walletLoginInPage({
                  address: state.walletLogin.address,
                  signature: state.walletLogin.signature,
                })
                .then(() => {
                  this.client.getAccount().then((acc) =>
                    state.actions.loginComplete({
                      account: acc,
                      isAuthenticated: true,
                      address: state.walletLogin.address,
                    })
                  );
                })
                .catch((err) => {
                  state.actions.error({
                    error: loginError(err),
                  });
                });
          }
        }
      }
    );
  }
}
