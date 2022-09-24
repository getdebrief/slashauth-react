import { useMemo } from 'react';
import { useAppearance } from '../../context/appearance';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useSignInContext } from './context';

type Props = {
  children: React.ReactNode;
};

const DARK_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';

export const SignInCard = ({ children }: Props) => {
  const slashAuth = useCoreSlashAuth();
  const { modalStyle } = useAppearance();
  const { walletConnectOnly } = useSignInContext();

  const headerTextAlign = useMemo(() => {
    switch (modalStyle.alignItems) {
      case 'flex-start':
        return 'left';
      case 'flex-end':
        return 'right';
      case 'center':
      case undefined:
      case null:
      default:
        return 'center';
    }
  }, [modalStyle.alignItems]);

  return (
    <>
      <img
        src={modalStyle.iconURL || DARK_SLASHAUTH_ICON}
        alt="Logo"
        style={{
          borderRadius: '16px',
          width: '48px',
          height: '48px',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <div style={{ marginTop: '1rem', textAlign: headerTextAlign }}>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>
          {slashAuth.appName || 'Unnamed App'}
        </div>
      </div>
      {children}
    </>
  );
};
