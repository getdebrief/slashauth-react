import { useRouter } from '../../router/context';
import { FailureScreen } from './screens/failure';

export const SignInError = () => {
  const { navigate } = useRouter();

  return <FailureScreen retry={() => navigate('../')} />;
};
