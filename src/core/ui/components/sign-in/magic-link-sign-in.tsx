import { useCallback, useState } from 'react';
import { Flow } from '../flow/flow';
import { useCoreClient } from '../../context/slashauth-client';
import { useRouter } from '../../router/context';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useSignInContext } from './context';
import { useInteraction } from '../../context/interaction';
import { MagicLinkScreen } from './screens/magic-link';
import { LoadingScreen } from './screens/loading';

export const MagicLinkSignIn = () => {
  const { setProcessing, processing } = useInteraction();
  const { connectAccounts } = useSignInContext();
  const slashAuth = useCoreSlashAuth();
  const { navigate } = useRouter();
  const client = useCoreClient();
  const [submittedEmail, setEmail] = useState('');

  const submitEmail = useCallback(
    async (email: string) => {
      setProcessing(true);
      try {
        setEmail(email);
        await client.magicLinkLogin({
          email,
          connectAccounts,
        });
        await slashAuth.checkLoginState();
        setProcessing(false);
        navigate('../success');
      } catch (error) {
        setProcessing(false);
        navigate('../error');
      }
    },
    [client, connectAccounts, setProcessing, navigate, slashAuth]
  );

  return (
    <Flow.Part part="emailLink">
      {processing ? (
        <LoadingScreen
          description={`A link was sent to ${submittedEmail}`}
          detailedDescription=""
          navigateBack={async () => {
            navigate('../');
          }}
        />
      ) : (
        <MagicLinkScreen
          navigateBack={() => navigate('../')}
          sendMagicLink={({ email }) => submitEmail(email)}
        />
      )}
    </Flow.Part>
  );
};
