import React from 'react';
import { useAppearance } from '../context/appearance';
import { Web3LoginMethod } from '../context/login-methods';

type Props = {
  loginMethod: Web3LoginMethod;
  onClick: () => void;
};

export const ConnectorButton = ({ loginMethod, onClick }: Props) => {
  const appearance = useAppearance();

  const [isHover, setHover] = React.useState(false);

  return (
    <button
      onClick={onClick}
      disabled={!loginMethod.ready}
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        width: '100%',
        backgroundColor: isHover
          ? appearance.modalStyle.hoverButtonBackgroundColor
          : appearance.modalStyle.buttonBackgroundColor,
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
        src={loginMethod.icon}
        alt="Connector Logo"
        style={{ width: '24px', height: '24px', marginRight: '1rem' }}
      />
      Connect with {loginMethod.name}
    </button>
  );
};
