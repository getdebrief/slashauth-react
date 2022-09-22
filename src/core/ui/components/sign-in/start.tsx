import { withCardStateProvider } from '../../context/card';
import { Flow } from '../flow/flow';
import { SignInWeb3Buttons } from './sign-in-web3-buttons';
import { SignInCard } from './card';
import { useSignInContext } from './context';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../router/context';
import { useWeb3LoginState } from '../../context/web3-signin';
import { LoadingModalContents } from './loading';
import { useLoginMethods } from '../../context/login-methods';

const _SignInStart = () => {
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

  const handleConnectWalletClick = useCallback(
    async (id: string) => {
      if (viewOnly) {
        return;
      }
      try {
        setSelectedLoginMethod(loginMethods.find((m) => m.id === id));
        setConnecting(true);
        await web3LoginState.web3Manager.connectToConnectorWithID(id);
        if (walletConnectOnly) {
          navigate('./success');
        } else {
          navigate('./sign-nonce');
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
      <SignInCard>
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
                  Connect your wallet:
                </p>
              </div>
              <SignInWeb3Buttons
                onConnectWalletClick={handleConnectWalletClick}
              />
            </div>
          </div>
        )}
      </SignInCard>
    </Flow.Part>
  );
};

export const SignInStart = withCardStateProvider(_SignInStart);
