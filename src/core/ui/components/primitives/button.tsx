import { useState } from 'react';

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

export const PrimaryButton = ({ children, onClick }: Props) => {
  const [isHover, setHover] = useState<boolean>(false);

  return (
    <button
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: 'none',
        border: 'none',
        borderRadius: 12,
        padding: '16px',
        backgroundColor: isHover ? '#0D3CFC' : '#0D5AFC',
        color: 'white',
        fontSize: 14,
        fontWeight: 400,
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

export const SecondaryButton = ({ children, onClick }: Props) => {
  const [isHover, setHover] = useState<boolean>(false);

  return (
    <button
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: 'none',
        border: '1px solid #0D5AFC',
        borderRadius: 12,
        padding: '16px',
        backgroundColor: isHover ? '#E6E6E6' : '#FFFFFF',
        color: '#0D5AFC',
        fontSize: 14,
        fontWeight: 400,
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};
