import { useEffect } from 'react';
import { withCardStateProvider } from '../../context/card';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';
import { useSignInContext } from './context';

const _SignInSuccess = () => {
  const slashAuth = useCoreSlashAuth();
  const { walletConnectOnly } = useSignInContext();

  useEffect(() => {
    setTimeout(() => slashAuth.closeSignIn(), 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flow.Part part="complete">
      <SignInCard>
        <div style={{ margin: '1rem 0', padding: '2rem' }}>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>
            {walletConnectOnly
              ? '🎉🎉🎉 You have successfully connected your wallet'
              : // eslint-disable-next-line quotes
                "🎉🎉🎉 You're successfully signed in!"}
          </p>
        </div>
      </SignInCard>
    </Flow.Part>
  );
};

export const SignInSuccess = withCardStateProvider(_SignInSuccess);
