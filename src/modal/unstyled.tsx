import React, { useMemo } from 'react';
import './style.css';
import { WagmiConnector } from '../provider/wagmi-connectors';
import { ConnectorButton } from './connector-button';
import { isFamilySupported, addFontFamily } from '../fonts';
import { LoginStep } from './core';
import { SigningTransactionModalContents } from './signing-transaction';

type ModalStyles = {
  defaultModalBodyStyles?: React.CSSProperties;
  backgroundColor?: string;
  borderRadius?: string;
  alignItems?: string;
  fontFamily?: string;
  fontColor?: string;
  buttonBackgroundColor?: string;
  hoverButtonBackgroundColor?: string;
  iconURL?: string;
};

type Props = {
  loginStep: LoginStep;
  styles: ModalStyles;
  wagmiConnector: WagmiConnector;
  viewOnly?: boolean;
};

export interface IModalContainerStyles {
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
  color: string;
}

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

const DARK_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';
const LIGHT_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-light.png';

export const UnstyledModal = ({
  loginStep,
  styles,
  wagmiConnector,
  viewOnly,
}: Props) => {
  const modalContentsStyle: React.CSSProperties = {
    width: '336px',
    height: '446px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '2rem',
  };

  const wrapperStyles = useMemo(() => {
    const resp: React.CSSProperties = {
      ...(styles.defaultModalBodyStyles || DEFAULT_MODAL_CONTAINER_STYLES),
    };
    if (styles.backgroundColor) {
      resp.background = styles.backgroundColor;
    }
    if (styles.borderRadius) {
      resp.borderRadius = styles.borderRadius;
    }
    if (styles.fontFamily) {
      if (isFamilySupported(styles.fontFamily)) {
        addFontFamily(styles.fontFamily);
        resp.fontFamily = styles.fontFamily;
      }
    }
    if (styles.fontColor) {
      resp.color = styles.fontColor;
    }

    return resp;
  }, [styles]);

  const bodyStyles = useMemo(() => {
    const resp: React.CSSProperties = {
      width: '100%',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      overflowY: 'hidden' as const,
    };

    if (styles.alignItems) {
      resp.alignItems = styles.alignItems;
    }

    console.log('body styles: ', resp);

    return resp;
  }, [styles.alignItems]);

  const walletLoginContents = useMemo(
    () => (
      <>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '16px', fontWeight: 400 }}>Login to continue</p>
        </div>
        <div
          className="slashauth-modal-scrollable"
          style={{
            overflowY: 'hidden',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {wagmiConnector.connectors
              .filter((connector) => connector.ready)
              .map((connector) => (
                <ConnectorButton
                  key={connector.id}
                  backgroundColor={styles.buttonBackgroundColor || '#ffffff'}
                  hoverColor={styles.hoverButtonBackgroundColor || '#f5f5f5'}
                  connector={connector}
                  onClick={() =>
                    !viewOnly &&
                    wagmiConnector
                      .connectToConnector(connector)
                      .catch((err) => console.error(err))
                  }
                />
              ))}
          </div>
        </div>
      </>
    ),
    [
      styles.buttonBackgroundColor,
      styles.hoverButtonBackgroundColor,
      viewOnly,
      wagmiConnector,
    ]
  );

  const modalStepContents = useMemo(() => {
    if (loginStep === LoginStep.CONNECT_WALLET) {
      return walletLoginContents;
    } else if (loginStep === LoginStep.SIGN_NONCE) {
      return <SigningTransactionModalContents />;
    }
    return walletLoginContents;
  }, [loginStep, walletLoginContents]);

  if (!wagmiConnector) {
    return <div />;
  }

  return (
    <div style={wrapperStyles} onClick={(e) => e.stopPropagation()}>
      <div
        className="slashauth-modal-body"
        style={{
          ...modalContentsStyle,
        }}
      >
        <div style={bodyStyles}>
          <img
            src={styles.iconURL || DARK_SLASHAUTH_ICON}
            alt="Logo"
            style={{
              borderRadius: '16px',
              width: '48px',
              height: '48px',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <div style={{ marginTop: '1rem' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Welcome!</h1>
          </div>
          {modalStepContents}
        </div>
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
};
