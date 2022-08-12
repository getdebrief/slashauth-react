import React from 'react';
import ReactDOM from 'react-dom';
import { LoginModal } from '.';
import { eventEmitter, LOGIN_STEP_CHANGED_EVENT } from '../events';
import { CONNECT_MODAL_ID, GetAppConfigResponse } from '../global';
import { WagmiConnector } from '../provider/wagmi-connectors';

const INITIAL_STATE = { show: false };

type LoginState = {
  step: LoginStep;
  additionalInfoCallback?: (info: Record<string, unknown>) => void;
  dismissCallback?: () => void;
};

export enum LoginStep {
  CONNECT_WALLET,
  SIGN_NONCE,
  ADDITIONAL_INFO,
  LOADING,
}

export class ModalCore {
  private show = false;
  private isRendered = false;
  private wagmiConnector: WagmiConnector;
  private _appConfig: GetAppConfigResponse | null = null;

  private loginState: LoginState = {
    step: LoginStep.LOADING,
  };

  constructor(w: WagmiConnector) {
    this.wagmiConnector = w;
  }

  get appConfig() {
    return this._appConfig;
  }
  set appConfig(v: GetAppConfigResponse | null) {
    this._appConfig = v;
    if (!this.isRendered) {
      setTimeout(() => this.renderModal(), 0);
    }
  }

  public setLoadingState = () => {
    this.loginState = {
      ...this.loginState,
      step: LoginStep.LOADING,
    };
    eventEmitter.emit(LOGIN_STEP_CHANGED_EVENT, {
      loginStep: LoginStep.LOADING,
    });
  };

  public setConnectWalletStep = () => {
    this.loginState = {
      ...this.loginState,
      step: LoginStep.CONNECT_WALLET,
    };
    eventEmitter.emit(LOGIN_STEP_CHANGED_EVENT, {
      loginStep: LoginStep.CONNECT_WALLET,
    });
  };

  public setSignNonceStep = () => {
    this.loginState = {
      ...this.loginState,
      step: LoginStep.SIGN_NONCE,
    };
    eventEmitter.emit(LOGIN_STEP_CHANGED_EVENT, {
      loginStep: LoginStep.SIGN_NONCE,
    });
  };

  public setAdditionalInfoStep = (
    requirements: string[],
    callbackFn: (info: Record<string, string>) => void
  ) => {
    this.loginState = {
      ...this.loginState,
      step: LoginStep.ADDITIONAL_INFO,
      additionalInfoCallback: callbackFn,
    };
    eventEmitter.emit(LOGIN_STEP_CHANGED_EVENT, {
      loginStep: LoginStep.ADDITIONAL_INFO,
      requirements,
    });
  };

  public async showModal(dismissFn: () => void): Promise<void> {
    if (this.show) {
      throw new Error('Modal is already showing');
    }
    this.loginState = {
      ...this.loginState,
      dismissCallback: dismissFn,
    };
    await this._toggleModal();
  }

  public async toggleModal(): Promise<void> {
    if (!this.isRendered) {
      this.renderModal();
    }
    await this._toggleModal();
  }

  public async hideModal(): Promise<void> {
    if (this.show) {
      await this._toggleModal();
    }
  }

  private renderModal() {
    let modalDiv = document.getElementById(CONNECT_MODAL_ID);
    if (!modalDiv) {
      modalDiv = document.createElement('div');
      modalDiv.id = CONNECT_MODAL_ID;
      document.body.appendChild(modalDiv);
    }

    this.isRendered = true;
    ReactDOM.render(
      <LoginModal
        initialLoginStep={this.loginState.step}
        resetState={this.resetState}
        onClose={this.onClose}
        appConfig={this._appConfig}
        wagmiConnector={this.wagmiConnector}
      />,
      document.getElementById(CONNECT_MODAL_ID)
    );
  }

  private _toggleModal = async () => {
    const d = typeof window !== 'undefined' ? document : '';
    const body = d ? d.body || d.getElementsByTagName('body')[0] : '';
    if (body) {
      if (this.show) {
        body.style.overflow = '';
      } else {
        body.style.overflow = 'hidden';
      }
    }
    await this.updateState({ show: !this.show });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateState = async (state: any) => {
    Object.keys(state).forEach((key) => {
      this[key] = state[key];
    });
    await window.updateModal(state);
  };

  private resetState = () => this.updateState({ ...INITIAL_STATE });

  private onClose = async () => {
    if (this.show) {
      await this._toggleModal();
    }
  };
}
