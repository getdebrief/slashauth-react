import {
  DEFAULT_MODAL_CONTAINER_STYLES,
  IModalContainerStyles,
  UnstyledModal,
} from './unstyled';
import React, { useEffect, useState } from 'react';
import { WagmiConnector } from '../provider/wagmi-connectors';
import { GetAppConfigResponse } from '../global';
import { LoginStep } from './core';
import { eventEmitter, LOGIN_STEP_CHANGED_EVENT } from '../events';

type Props = {
  initialLoginStep: LoginStep;
  wagmiConnector: WagmiConnector;
  appConfig: GetAppConfigResponse | null;
  resetState: () => void;
  onClose: () => void;
};

declare global {
  // tslint:disable-next-line
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateModal: any;
  }
}

interface IModalState {
  show: boolean;
  containerStyles: IModalContainerStyles;
}

export const LoginModal = ({
  initialLoginStep,
  wagmiConnector,
  appConfig,
  resetState,
  onClose,
}: Props) => {
  const [loginStep, setLoginStep] = useState<LoginStep>(initialLoginStep);
  const [requirements, setRequirements] = useState<string[]>(null);
  const [modalState, setModalState] = useState<IModalState>({
    show: false,
    containerStyles: DEFAULT_MODAL_CONTAINER_STYLES,
  });

  useEffect(() => {
    window.updateModal = async (state: IModalState) => {
      if (modalState.show && !state.show) {
        resetState();
      }
      setModalState((cur) => ({
        show: state.show,
        containerStyles: state.containerStyles || cur.containerStyles,
      }));
    };
    const handleLoginStepChanged = (input: {
      loginStep: LoginStep;
      requirements?: string[];
    }) => {
      setLoginStep(input.loginStep);
      setRequirements(input.requirements || null);
    };
    eventEmitter.on(LOGIN_STEP_CHANGED_EVENT, handleLoginStepChanged);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.updateModal = () => {};
      eventEmitter.off(LOGIN_STEP_CHANGED_EVENT, handleLoginStepChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(35, 35, 35, 0.5)',
        display: modalState.show ? 'block' : 'none',
      }}
      onClick={onClose}
    >
      <UnstyledModal
        requirements={requirements}
        loginStep={loginStep}
        styles={{
          defaultModalBodyStyles: modalState.containerStyles,
          ...(appConfig?.modalStyle || {}),
        }}
        wagmiConnector={wagmiConnector}
      />
    </div>
  );
};
