import React from 'react';
import { addFontFamily, isFamilySupported } from '../../fonts';
import { animations } from '../../styles/animation';
import { transitionTiming } from '../../styles/transitions';
import { IModalContainerStyles, ModalStyles } from '../../types/modal';

type Props = {
  modalStyles: ModalStyles;
  children: React.ReactNode;
};

export const DEFAULT_MODAL_CONTAINER_STYLES: IModalContainerStyles = {
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
  color: 'black',
  animation: `${animations.modalSlideAndFade} 180ms ${transitionTiming.easeOut}`,
};

export const ModalContent = React.forwardRef<HTMLDivElement, Props>(
  ({ modalStyles, children }: Props, ref) => {
    const wrapperStyles = React.useMemo(() => {
      const resp: React.CSSProperties = {
        ...(modalStyles.defaultModalBodyStyles ||
          DEFAULT_MODAL_CONTAINER_STYLES),
      };
      if (modalStyles.backgroundColor) {
        resp.background = modalStyles.backgroundColor;
      }
      if (modalStyles.borderRadius) {
        resp.borderRadius = modalStyles.borderRadius;
      }
      if (modalStyles.fontFamily) {
        if (isFamilySupported(modalStyles.fontFamily)) {
          addFontFamily(modalStyles.fontFamily);
          resp.fontFamily = modalStyles.fontFamily;
        }
      }
      if (modalStyles.fontColor) {
        resp.color = modalStyles.fontColor;
      }

      return resp;
    }, [modalStyles]);

    return (
      <div
        ref={ref}
        aria-modal="true"
        role="dialog"
        style={wrapperStyles}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    );
  }
);
