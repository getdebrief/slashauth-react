import { useMemo } from 'react';
import { useAppearance } from '../../context/appearance';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useSignInContext } from './context';
import { SignInWeb3Buttons } from './sign-in-web3-buttons';

type Props = {
  children: React.ReactNode;
};

const DARK_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';
const LIGHT_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-light.png';

export const SignInCard = ({ children }: Props) => {
  const slashAuth = useCoreSlashAuth();
  const { modalStyle } = useAppearance();
  const { walletConnectOnly } = useSignInContext();

  // const modalStepContents = useMemo(() => {
  //   if (!hasFetchedAppConfig) {
  //     return <LoadingModalContents textColor={styles.fontColor || '#000000'} />;
  //   }

  //   if (loginStep === LoginStep.CONNECT_WALLET) {
  //     return walletLoginContents;
  //   } else if (loginStep === LoginStep.SIGN_NONCE) {
  //     return <SigningTransactionModalContents />;
  //   } else if (loginStep === LoginStep.LOADING) {
  //     return <LoadingModalContents textColor={styles.fontColor || '#000000'} />;
  //   }
  //   return walletLoginContents;
  // }, [hasFetchedAppConfig, styles.fontColor, walletLoginContents]);

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
          {walletConnectOnly ? 'Connect Wallet' : 'Login'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>
          {' '}
          {slashAuth.appName || 'Unnamed App'}
        </div>
      </div>
      {children}
    </>
  );
};
