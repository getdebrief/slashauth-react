import { useState } from 'react';
import { useAppearance } from '../../context/appearance';

type Props = {
  disabled?: boolean;
  additionalStyles?: React.CSSProperties;
  children: React.ReactNode;
  onClick: () => void;
};

export const AbstractConnectorButton = ({
  onClick,
  disabled,
  additionalStyles,
  children,
}: Props) => {
  const appearance = useAppearance();
  const [isHover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        alignItems: 'center',
        display: 'flex',
        width: '100%',
        backgroundColor: isHover
          ? appearance.modalStyle.hoverButtonBackgroundColor
          : appearance.modalStyle.buttonBackgroundColor,
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        marginBottom: '0.5rem',
        fontSize: '12px',
        cursor: 'pointer',
        minHeight: '2.625rem',
        ...additionalStyles,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};
