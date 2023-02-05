import { useCallback, useMemo, useState } from 'react';
import { Flow } from '../flow/flow';
import { useCoreClient } from '../../context/slashauth-client';
import { useRouter } from '../../router/context';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useSignInContext } from './context';
import { useInteraction, InteractionContext } from '../../context/interaction';
import { MagicLinkVerifyEmailScreen } from './screens/magic-link-verify-email';
import { LoadingScreen } from './screens/loading';
import { useWeb3LoginState } from '../../context/web3-signin';

export const MagicLinkVerifyEmail = () => {
  const { setProcessing, processing } = useInteraction();
  const { connectAccounts } = useSignInContext();
  const slashAuth = useCoreSlashAuth();
  const { navigate } = useRouter();
  const client = useCoreClient();
  const [submittedEmail, setEmail] = useState('');
  const { address } = useWeb3LoginState();

  const submitEmail = useCallback(
    async (email: string) => {
      setProcessing(true);
      try {
        setEmail(email);
        await client.magicLinkVerify({
          email,
          walletAddress: address,
          isVerificationEmail: true,
        });
        await slashAuth.checkLoginState();
        setProcessing(false);
        navigate('../success');
      } catch (error) {
        console.error(error);
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
        <MagicLinkVerifyEmailScreen
          navigateBack={() => navigate('../')}
          sendMagicLink={({ email }) => submitEmail(email)}
        />
      )}
    </Flow.Part>
  );
};
