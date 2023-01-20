import { useEffect } from 'react';
import { withCardStateProvider } from '../../context/card';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Flow } from '../flow/flow';
import { SuccessScreen } from './screens/success';

const _SignInSuccess = () => {
  const slashAuth = useCoreSlashAuth();

  useEffect(() => {
    setTimeout(() => slashAuth.closeSignIn(), 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flow.Part part="complete">
      <SuccessScreen />
    </Flow.Part>
  );
};

export const SignInSuccess = withCardStateProvider(_SignInSuccess);
