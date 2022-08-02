import React from 'react';
import './style.css';
import { WagmiConnector } from '../provider/wagmi-connectors';
import { ConnectorButton } from './connector-button';
import { Connector } from '@wagmi/core';

type Props = {
  styles: React.CSSProperties;
  wagmiConnector: WagmiConnector;
};

export const UnstyledModal = ({ styles, wagmiConnector }: Props) => {
  const modalContentsStyle: React.CSSProperties = {
    width: '336px',
    maxHeight: '443px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '2rem',
  };

  if (!wagmiConnector) {
    return <div />;
  }

  return (
    <div style={styles} onClick={(e) => e.stopPropagation()}>
      <div
        className="slashauth-modal-body"
        style={{
          ...modalContentsStyle,
          alignItems: 'center',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          overflowY: 'hidden',
        }}
      >
        <div
          style={{
            flexGrow: 1,
            width: '100%',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden',
          }}
        >
          <img
            src="https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png"
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
            <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Welcome!</h1>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '16px', fontWeight: 400 }}>
              Login to continue
            </p>
          </div>
          <div
            className="slashauth-modal-scrollable"
            style={{
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {wagmiConnector.connectors.map((connector) => (
              <ConnectorButton
                key={connector.id}
                connector={connector}
                onClick={() =>
                  connector
                    .connect({
                      chainId: wagmiConnector.client.lastUsedChainId,
                    })
                    .then(() => {
                      wagmiConnector.onConnectorConnect(connector);
                    })
                    .catch((err) => console.error(err))
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow:
            '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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
