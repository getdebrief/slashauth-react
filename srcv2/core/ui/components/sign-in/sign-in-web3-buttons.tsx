import React from 'react';
import { useLoginMethods, Web3LoginMethod } from '../../context/login-methods';
import { ConnectorButton } from '../web3-login-button';

export const SignInWeb3Buttons = () => {
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
          <ConnectorButton
            key={loginMethod.id}
            loginMethod={loginMethod}
            onClick={() => console.log('clicked')}
          />
        );
      })}
    </>
  );
};
