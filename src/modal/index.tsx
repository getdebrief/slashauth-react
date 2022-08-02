import { UnstyledModal } from './unstyled';
import React, { useEffect, useState } from 'react';
import { WagmiConnector } from '../provider/wagmi-connectors';

type Props = {
  wagmiConnector: WagmiConnector;
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

interface IModalContainerStyles {
  position: 'absolute' | 'fixed' | 'relative' | 'static';
  top: string;
  left: string;
  right: string;
  bottom: string;
  marginRight: string;
  transform: string;
  borderRadius: string;
  padding: string;
  border: string;
  background: string;
}

const DEFAULT_MODAL_CONTAINER_STYLES: IModalContainerStyles = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  right: 'auto',
  bottom: 'auto',
  marginRight: '-50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '8px',
  padding: '0px',
  border: 'none',
  background: 'white',
};

interface IModalState {
  show: boolean;
  containerStyles: IModalContainerStyles;
}

export const LoginModal = ({ wagmiConnector, resetState, onClose }: Props) => {
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
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.updateModal = () => {};
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
        styles={modalState.containerStyles}
        wagmiConnector={wagmiConnector}
      />
    </div>
    // </ReactModal>
  );
};
