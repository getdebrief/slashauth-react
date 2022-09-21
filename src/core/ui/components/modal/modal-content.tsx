import React, { useMemo } from 'react';
import { addFontFamily, isFamilySupported } from '../../fonts';
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
};

export const ModalContent = React.forwardRef<HTMLDivElement, Props>(
  ({ modalStyles, children }: Props, ref) => {
    const modalContentsStyle: React.CSSProperties = {
      width: 'calc(336px - 2rem)',
      height: '446px',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '2rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    };

    const wrapperStyles = useMemo(() => {
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

    const bodyStyles = useMemo(() => {
      const resp: React.CSSProperties = {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        overflowY: 'hidden' as const,
      };

      if (modalStyles.alignItems) {
        resp.alignItems = modalStyles.alignItems;
      }

      return resp;
    }, [modalStyles.alignItems]);

    return (
      <div
        style={wrapperStyles}
        ref={ref}
        aria-modal="true"
        role="dialog"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="slashauth-modal-body"
          style={{
            ...modalContentsStyle,
          }}
        >
          <div style={bodyStyles}>{children}</div>
        </div>
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '1px solid #e6e6e6',
            width: '100%',
            paddingBottom: '1rem',
            paddingTop: '1rem',
          }}
        >
          <span style={{ fontSize: '12px', color: '#9B9B9B' }}>
            Powered by /auth
          </span>
        </div>
      </div>
    );
  }
);
