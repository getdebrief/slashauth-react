import { withCardStateProvider } from '../../context/card';
import { Flow } from '../flow/flow';
import { useSignInContext } from './context';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../router/context';
import { useWeb3LoginState } from '../../context/web3-signin';
import {
  LoginMethod,
  LoginMethodType,
  useLoginMethods,
} from '../../context/login-methods';
import { useInteraction } from '../../context/interaction';
import { SignInScreen } from './screens/sign-in';
import { LoadingScreen } from './screens/loading';
import { useCoreSlashAuth } from '../../context/core-slashauth';

type Props = {
  showAllWallets?: boolean;
  showBackButton?: boolean;
};

const _SignInStart = ({ showAllWallets, showBackButton }: Props) => {
  const { setProcessing } = useInteraction();
  const { viewOnly, walletConnectOnly } = useSignInContext();
  const { navigate, fullPath } = useRouter();
  const web3LoginState = useWeb3LoginState();
  const { setSelectedLoginMethodById, selectedLoginMethod } = useLoginMethods();
  const slashAuth = useCoreSlashAuth();

  const [isConnecting, setConnecting] = useState(false);

  useEffect(() => {
    setSelectedLoginMethodById(null);
    setConnecting(false);
    return () => {
      setConnecting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginButtonClick = useCallback(
    async (loginMethod: LoginMethod) => {
      if (viewOnly) {
        return;
      }
      try {
        setSelectedLoginMethodById(loginMethod.id);
        setConnecting(true);
        if (loginMethod.type === LoginMethodType.Web3) {
          try {
            setProcessing(true);
            await web3LoginState.web3Manager.connectToConnectorWithID(
              loginMethod.id
            );
          } catch (err) {
            // If we caught an error, we should reset the state?
            return;
          } finally {
            setProcessing(false);
          }
          if (walletConnectOnly) {
            navigate('./success');
          } else {
            const location = fullPath.endsWith('/all-wallets')
              ? '../sign-nonce'
              : './sign-nonce';
            await navigate(location);
          }
        } else {
          if (loginMethod.type === LoginMethodType.MagicLink) {
            // Handle web2 login here.
            navigate('./magic-link');
          } else if (loginMethod.type === LoginMethodType.FederatedGoogle) {
            navigate('./federated-google');
          } else if (loginMethod.type === LoginMethodType.FederatedDiscord) {
            navigate('./federated-discord');
          }
        }
      } finally {
        setConnecting(false);
      }
    },
    [
      fullPath,
      navigate,
      setProcessing,
      setSelectedLoginMethodById,
      viewOnly,
      walletConnectOnly,
      web3LoginState.web3Manager,
    ]
  );

  return (
    <Flow.Part part="start">
      {isConnecting ? (
        <LoadingScreen
          description={`Connecting to ${selectedLoginMethod.name}`}
          detailedDescription={`Confirm your wallet connection in ${slashAuth.appName}`}
          navigateBack={async () => {
            await web3LoginState.web3Manager.disconnect();
            setConnecting(false);
          }}
        />
      ) : (
        <SignInScreen startLoginWith={handleLoginButtonClick} />
      )}
    </Flow.Part>
  );
};

export const SignInStart = withCardStateProvider(_SignInStart);
