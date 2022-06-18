import { useEffect, useRef, useState } from 'react';
import { useConnect } from 'wagmi';

declare global {
  // tslint:disable-next-line
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BinanceChain: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    web3: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    celo: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateWeb3Modal: any;
  }
}

interface IModalState {
  show: boolean;
  lightboxOffset: number;
}

const INITIAL_STATE: IModalState = {
  show: false,
  lightboxOffset: 0,
};

type Props = {
  onClose: () => void;
  resetState: () => void;
  lightboxOpacity?: number;
};

export const Modal = ({ lightboxOpacity, onClose, resetState }: Props) => {
  const { connectors } = useConnect();

  const [modalState, setModalState] = useState<IModalState>(INITIAL_STATE);

  useEffect(() => {
    window.updateWeb3Modal = async (state: IModalState) => {
      setModalState(state);
    };
  });

  const lightboxRef = useRef<HTMLDivElement>(null);
  const mainModalCard = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalState.show) {
      resetState();
    }
  }, [modalState.show, resetState]);

  useEffect(() => {
    if (lightboxRef.current) {
      const rect = lightboxRef.current.getBoundingClientRect();
      const offset = rect.top > 0 ? rect.top : 0;

      if (
        offset !== INITIAL_STATE.lightboxOffset &&
        offset !== modalState.lightboxOffset
      ) {
        setModalState({
          ...modalState,
          lightboxOffset: offset,
        });
      }
    }
  }, [modalState, modalState.lightboxOffset]);

  return (
    <div
      style={{
        transition: 'opacity 0.1s ease-in-out',
        textAlign: 'center',
        position: 'fixed',
        width: '100%',
        height: '100%',
        marginLeft: '-50vw',
        top: modalState.lightboxOffset ? `-${modalState.lightboxOffset}px` : 0,
        left: '50%',
        zIndex: '100',
        willChange: 'opacity',
        backgroundColor: `rgba(0, 0, 0, ${
          typeof lightboxOpacity === 'number' ? lightboxOpacity : 0.4
        })`,
        opacity: `${modalState.show ? 1 : 0}`,
        visibility: `${modalState.show ? 'visible' : 'hidden'}`,
        pointerEvents: `${modalState.show ? 'auto' : 'none'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      ref={lightboxRef}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: `${modalState.show ? 1 : 0}`,
          visibility: `${modalState.show ? 'visible' : 'hidden'}`,
          pointerEvents: `${modalState.show ? 'auto' : 'none'}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            backgroundColor: 'black',
            borderRadius: '12px',
            margin: '10px',
            padding: 0,
            opacity: `${modalState.show ? 1 : 0}`,
            visibility: `${modalState.show ? 'visible' : 'hidden'}`,
            pointerEvents: `${modalState.show ? 'auto' : 'none'}`,

            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
            overflow: 'auto',
          }}
          ref={mainModalCard}
        >
          {connectors.map((connector) => (
            <div
              style={{
                width: '100%',
                borderRadius: '12px',
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.0)',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: 700,
                marginTop: '0.5em',
              }}
            >
              {connector.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
