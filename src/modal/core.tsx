import React from 'react';
import ReactDOM from 'react-dom';
import { LoginModal } from '.';
import { CONNECT_MODAL_ID, GetAppConfigResponse } from '../global';
import { WagmiConnector } from '../provider/wagmi-connectors';

const INITIAL_STATE = { show: false };

export class ModalCore {
  private show = false;
  private isRendered = false;
  private wagmiConnector: WagmiConnector;
  private _appConfig: GetAppConfigResponse | null = null;

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
