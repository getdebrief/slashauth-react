import { withCardStateProvider } from '../../context/card';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';
import { useSignInContext } from './context';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../router/context';
import { useWeb3LoginState } from '../../context/web3-signin';
import { LoadingModalContents } from './loading';
import {
  LoginMethod,
  LoginMethodType,
  useLoginMethods,
} from '../../context/login-methods';
import { SignInButtons } from './sign-in-buttons';

type Props = {
  showAllWallets?: boolean;
  showBackButton?: boolean;
};

const _SignInStart = ({ showAllWallets, showBackButton }: Props) => {
  const { viewOnly, walletConnectOnly } = useSignInContext();
  const { navigate } = useRouter();
  const web3LoginState = useWeb3LoginState();
  const { loginMethods, setSelectedLoginMethod } = useLoginMethods();

  const [isConnecting, setConnecting] = useState(false);

  useEffect(() => {
    setSelectedLoginMethod(null);
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
        setSelectedLoginMethod(
          loginMethods.find((m) => m.id === loginMethod.id)
        );
        setConnecting(true);
        if (loginMethod.type === LoginMethodType.Web3) {
          await web3LoginState.web3Manager.connectToConnectorWithID(
            loginMethod.id
          );
          if (walletConnectOnly) {
            navigate('./success');
          } else {
            navigate('./sign-nonce');
          }
        } else {
          // Handle web2 login here.
          navigate('./magic-link');
        }
      } finally {
        setConnecting(false);
      }
    },
    [
      loginMethods,
      navigate,
      setSelectedLoginMethod,
      viewOnly,
      walletConnectOnly,
      web3LoginState.web3Manager,
    ]
  );

  return (
    <Flow.Part part="start">
      <SignInCard showBackButton={showBackButton}>
        {isConnecting ? (
          <LoadingModalContents />
        ) : (
          <div
            className="slashauth-modal-scrollable"
            style={{
              overflowY: 'hidden',
              width: '100%',
              marginTop: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textAlign: 'start',
                  }}
                >
                  {walletConnectOnly ? 'Continue' : 'Sign in'} with:
                </p>
              </div>
              <SignInButtons
                onClick={handleLoginButtonClick}
                showAllWallets={showAllWallets}
              />
            </div>
          </div>
        )}
      </SignInCard>
    </Flow.Part>
  );
};

export const SignInStart = withCardStateProvider(_SignInStart);
