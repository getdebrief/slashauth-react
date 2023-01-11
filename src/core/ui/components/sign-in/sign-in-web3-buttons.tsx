import { useMemo } from 'react';
import { LoginMethod, useLoginMethods } from '../../context/login-methods';
import { useRouter } from '../../router/context';
import { WalletConnectorButton } from './web3-login-button';
import { AbstractConnectorButton } from './abstract-login-button';
import { PlusIcon } from '@heroicons/react/outline';

type Props = {
  showMoreAfter: number;
  onClick: (loginMethod: LoginMethod) => void;
};

export const SignInWeb3Buttons = ({ showMoreAfter, onClick }: Props) => {
  const { navigate } = useRouter();
  const { web3 } = useLoginMethods();

  const loginMethodsToShow = useMemo(() => {
    const filteredMethods = web3.filter((m) => m.ready);
    if (showMoreAfter > 0 && showMoreAfter < filteredMethods.length) {
      return filteredMethods.slice(0, showMoreAfter);
    }
    return filteredMethods;
  }, [showMoreAfter, web3]);

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
      {showMoreAfter > 0 && showMoreAfter < web3.length && (
        <AbstractConnectorButton onClick={() => navigate('./all-wallets')}>
          <PlusIcon
            style={{ width: '24px', height: '24px', marginRight: '1rem' }}
          />
          Show more wallets
        </AbstractConnectorButton>
      )}
    </>
  );
};
