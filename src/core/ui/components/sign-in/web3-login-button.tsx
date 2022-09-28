import { useMemo } from 'react';
import { Web3LoginMethod } from '../../context/login-methods';
import { AbstractConnectorButton } from './abstract-login-button';
import { useSignInContext } from './context';

type Props = {
  loginMethod: Web3LoginMethod;
  onClick: () => void;
};

export const WalletConnectorButton = ({ loginMethod, onClick }: Props) => {
  const { walletConnectOnly } = useSignInContext();

  const icon = useMemo(() => {
    switch (loginMethod.id) {
      case 'metaMask':
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/metamask.png';
      case 'coinbaseWallet':
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/coinbase.png';
      case 'walletConnect':
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/wallet-connect.png';
      default:
        return 'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';
    }
  }, [loginMethod.id]);

  return (
    <AbstractConnectorButton onClick={onClick} disabled={!loginMethod.ready}>
      <img
        src={icon}
        alt="Connector Logo"
        style={{ width: '24px', height: '24px', marginRight: '1rem' }}
      />
      {walletConnectOnly ? 'Connect with' : 'Sign in with'} {loginMethod.name}
    </AbstractConnectorButton>
  );
};
