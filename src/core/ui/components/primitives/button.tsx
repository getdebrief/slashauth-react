import { useState } from 'react';
import { useAppearance } from '../../context/appearance';
import { classNames } from '../../../../shared/utils/classnames';
import { HighlightedIcon } from './icon';
import { Flex } from './container';
import styles from './button.module.css';

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

const DEFAULT_BORDER_RADIUS = 12;

export const PrimaryButton = ({ children, onClick }: Props) => {
  const [isHover, setHover] = useState<boolean>(false);

  const appearance = useAppearance();

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
        borderRadius:
          appearance.modalStyle.borderRadius || DEFAULT_BORDER_RADIUS,
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

  const appearance = useAppearance();

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
        borderRadius:
          appearance.modalStyle.borderRadius || DEFAULT_BORDER_RADIUS,
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

interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  padding?: number;
  wide?: boolean;
  primary?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const BaseButton = ({
  padding,
  wide,
  primary,
  children,
  className,
  ...props
}: BaseButtonProps) => (
  <button
    {...props}
    style={{ padding: padding }}
    className={classNames(
      styles.baseButton,
      wide && styles.wide,
      primary && styles.primaryButton,
      className
    )}
  >
    {children}
  </button>
);

export const ButtonWithIcon = ({ icon, children, ...props }) => (
  <BaseButton {...props} wide padding={12}>
    <Flex gap={17} alignItems="center">
      <HighlightedIcon>{icon}</HighlightedIcon>
      {children}
    </Flex>
  </BaseButton>
);
