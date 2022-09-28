import { useMemo } from 'react';
import {
  LoginMethod,
  useLoginMethods,
  Web3LoginMethod,
} from '../../context/login-methods';
import { useRouter } from '../../router/context';
import { WalletConnectorButton } from './web3-login-button';
import { AbstractConnectorButton } from './abstract-login-button';

type Props = {
  showMoreAfter: number;
  onClick: (loginMethod: LoginMethod) => void;
};

export const SignInWeb3Buttons = ({ showMoreAfter, onClick }: Props) => {
  const { navigate } = useRouter();
  const enabledLoginMethods = useLoginMethods();

  const web3LoginMethods = useMemo(() => {
    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type === 'web3'
    ) as unknown as Web3LoginMethod[];
  }, [enabledLoginMethods.loginMethods]);

  const loginMethodsToShow = useMemo(() => {
    if (showMoreAfter > 0 && showMoreAfter < web3LoginMethods.length) {
      return web3LoginMethods.slice(0, showMoreAfter);
    }
    return web3LoginMethods;
  }, [showMoreAfter, web3LoginMethods]);

  return (
    <>
      {loginMethodsToShow.map((loginMethod) => {
        return (
          <WalletConnectorButton
            key={loginMethod.id}
            loginMethod={loginMethod}
            onClick={() => onClick(loginMethod)}
          />
        );
      })}
      {showMoreAfter > 0 && showMoreAfter < web3LoginMethods.length && (
        <AbstractConnectorButton onClick={() => navigate('./all-wallets')}>
          Show more wallets
        </AbstractConnectorButton>
      )}
    </>
  );
};
