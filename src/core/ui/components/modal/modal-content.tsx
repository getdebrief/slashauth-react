import React, { useMemo } from 'react';
import { addFontFamily, isFamilySupported } from '../../fonts';
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
      width: '336px',
      maxHeight: '446px',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '3rem',
      paddingLeft: '2rem',
      paddingRight: '2rem',
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
            width: '100%',
            paddingBottom: '3rem',
            paddingTop: '1.5rem',
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
