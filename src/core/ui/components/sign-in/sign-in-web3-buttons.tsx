import React from 'react';
import { useLoginMethods, Web3LoginMethod } from '../../context/login-methods';
import { WalletConnectorButton } from '../web3-login-button';
import { MagicLinkConnectorButton } from './magic-link-login-button';

type Props = {
  onConnectWalletClick: (id: string) => void;
};

export const SignInWeb3Buttons = ({ onConnectWalletClick }: Props) => {
  const enabledLoginMethods = useLoginMethods();

  const web3LoginMethods = React.useMemo(() => {
    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type === 'web3'
    ) as unknown as Web3LoginMethod[];
  }, [enabledLoginMethods.loginMethods]);

  return (
    <>
      {web3LoginMethods.map((loginMethod) => {
        return (
          <WalletConnectorButton
            key={loginMethod.id}
            loginMethod={loginMethod}
            onClick={() => onConnectWalletClick(loginMethod.id)}
          />
        );
      })}
      <MagicLinkConnectorButton onClick={() => console.log('click')} />
    </>
  );
};
