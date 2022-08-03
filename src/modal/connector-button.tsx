import { Connector } from '@wagmi/core';
import React, { useMemo, useState } from 'react';

type Props = {
  connector: Connector;
  backgroundColor: string;
  hoverColor: string;
  onClick: () => void;
};

export const ConnectorButton = ({
  connector,
  backgroundColor,
  hoverColor,
  onClick,
}: Props) => {
  const [isHover, setHover] = useState(false);

  const icon = useMemo(() => {
    switch (connector.id) {
      case 'metaMask':
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/metamask.png';
      case 'coinbaseWallet':
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/coinbase.png';
      case 'walletConnect':
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/wallet-connect.png';
      default:
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';
    }
  }, [connector.id]);

  return (
    <button
      onClick={onClick}
      disabled={!connector.ready}
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        width: '100%',
        backgroundColor: isHover ? hoverColor : backgroundColor,
        border: '1px solid #e5e7eb',
        borderRadius: '15px',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        marginBottom: '0.5rem',
        fontSize: '12px',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={icon}
        alt="Connector Logo"
        style={{ width: '24px', height: '24px', marginRight: '1rem' }}
      />
      Connect with {connector.name}
    </button>
  );
};
