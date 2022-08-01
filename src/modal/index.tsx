import { UnstyledModal } from './unstyled';
import ReactModal from 'react-modal';
import { useEffect, useState } from 'react';

type Props = {
  resetState: () => void;
};

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

export const LoginModal = ({ resetState }: Props) => {
  const [modalState, setModalState] = useState<IModalState>({
    show: false,
    containerStyles: DEFAULT_MODAL_CONTAINER_STYLES,
  });

  useEffect(() => {
    window.updateWeb3Modal = async (state: IModalState) => {
      if (modalState.show && !state.show) {
        resetState();
      }
      setModalState((cur) => ({
        show: state.show,
        containerStyles: state.containerStyles || cur.containerStyles,
      }));
    };
  }, []);

  return (
    <ReactModal
      isOpen={modalState.show}
      onRequestClose={() => setModalState({ ...modalState, show: false })}
      style={{
        overlay: {
          backgroundColor: 'rgba(35, 35, 35, 0.5)',
          zIndex: 9999,
        },
        content: modalState.containerStyles,
      }}
    >
      <UnstyledModal />
    </ReactModal>
  );
};
