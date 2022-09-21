import React from 'react';
import { useLoginMethods, Web3LoginMethod } from '../../context/login-methods';
import { useWeb3LoginState } from '../../context/web3-signin';
import { useRouter } from '../../router/context';
import { ConnectorButton } from '../web3-login-button';
import { useSignInContext } from './context';

export const SignInWeb3Buttons = () => {
  const { walletConnectOnly, viewOnly } = useSignInContext();
  const enabledLoginMethods = useLoginMethods();
  const web3LoginState = useWeb3LoginState();

  const web3LoginMethods = React.useMemo(() => {
    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type === 'web3'
    ) as unknown as Web3LoginMethod[];
  }, [enabledLoginMethods.loginMethods]);

  const { navigate } = useRouter();

  return (
    <>
      {web3LoginMethods.map((loginMethod) => {
        return (
          <ConnectorButton
            key={loginMethod.id}
            loginMethod={loginMethod}
            onClick={async () => {
              if (viewOnly) {
                return;
              }
              await web3LoginState.web3Manager.connectToConnectorWithID(
                loginMethod.id
              );
              if (walletConnectOnly) {
                navigate('./success');
              } else {
                navigate('./sign-nonce');
              }
            }}
          />
        );
      })}
    </>
  );
};
