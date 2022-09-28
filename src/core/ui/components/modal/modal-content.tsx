import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addFontFamily, isFamilySupported } from '../../fonts';
import { IModalContainerStyles, ModalStyles } from '../../types/modal';

type Props = {
  modalStyles: ModalStyles;
  children: React.ReactNode;
};

const MAX_HEIGHT_PX = 600;

const baseModalContainerStyles = {
  width: '366px',
  height: `${MAX_HEIGHT_PX}px`,
  transition: 'max-height 0.2s ease-in-out',
  WebkitTransition: 'max-height 0.2s ease-in-out',
  overflow: 'hidden',
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
    const [baseModalStyles, setBaseModalStyles] = useState({
      ...baseModalContainerStyles,
    });

    const [modalContentsStyle, setModalContentStyle] =
      useState<React.CSSProperties>({
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '3rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
      });

    const footerRef = useRef<HTMLDivElement>();
    const bodyRef = useRef<HTMLDivElement>();
    const modalRef = useRef<HTMLDivElement>();
    const observerRef = useRef<ResizeObserver>(
      new ResizeObserver(() => {
        if (bodyRef.current && footerRef.current) {
          const totalHeight =
            bodyRef.current.scrollHeight + footerRef.current.scrollHeight;
          setBaseModalStyles((curr) => ({
            ...curr,
            maxHeight: `${Math.min(totalHeight, MAX_HEIGHT_PX)}px`,
          }));
        }
      })
    );

    useEffect(() => {
      const observer = observerRef.current;
      let unobserveElement: HTMLDivElement | null = null;
      if (bodyRef.current) {
        observerRef.current.observe(bodyRef.current);
        unobserveElement = modalRef.current;
      }

      return () => {
        if (unobserveElement) {
          observer.unobserve(unobserveElement);
        }
      };
    }, []);

    const wrapperStyles = useMemo(() => {
      const resp: React.CSSProperties = {
        ...(modalStyles.defaultModalBodyStyles ||
          DEFAULT_MODAL_CONTAINER_STYLES),
      };
      console.log(modalStyles);
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

      console.log(resp);

      return {
        ...resp,
        ...baseModalStyles,
      };
    }, [
      baseModalStyles,
      modalStyles.backgroundColor,
      modalStyles.borderRadius,
      modalStyles.defaultModalBodyStyles,
      modalStyles.fontColor,
      modalStyles.fontFamily,
    ]);

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
        ref={(node) => {
          modalRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        aria-modal="true"
        role="dialog"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="slashauth-modal-body"
          ref={bodyRef}
          style={{
            ...modalContentsStyle,
          }}
        >
          <div style={bodyStyles}>{children}</div>
        </div>
        <div
          ref={footerRef}
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
