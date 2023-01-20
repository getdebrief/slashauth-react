import { useCallback, useMemo, useState } from 'react';
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

  const isGmail = useMemo(
    () => submittedEmail.includes('@gmail'),
    [submittedEmail]
  );

  return (
    <Flow.Part part="emailLink">
      {processing ? (
        <LoadingScreen
          description={`A link was sent to ${submittedEmail}`}
          detailedDescription={
            isGmail ? (
              <>
                You can also{' '}
                <a
                  href="https://mail.google.com/mail/"
                  rel="noreferrer"
                  target="_blank"
                >
                  view the link here.
                </a>
              </>
            ) : null
          }
          navigateBack={async () => {
            setProcessing(false);
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
