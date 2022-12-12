import { useEffect, useMemo, useState } from 'react';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';
import { LoadingModalContents } from './loading';
import { useCoreClient } from '../../context/slashauth-client';
import { useRouter } from '../../router/context';
import { useSignInContext } from './context';
import { useInteraction } from '../../context/interaction';

export const FederatedGoogleSignIn = () => {
  const { setProcessing } = useInteraction();
  const { connectAccounts } = useSignInContext();
  const { navigate } = useRouter();
  const client = useCoreClient();
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .googleLogin({
        connectAccounts,
      })
      .then((resp) => {
        navigate('../success');
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setProcessing(false);
      });
    setProcessing(true);
    return () => setProcessing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contents = useMemo(() => {
    return (
      <LoadingModalContents
        textContent={'Check the new tab to complete your login with Google'}
      />
    );
  }, []);

  return (
    <Flow.Part part="emailLink">
      <SignInCard showBackButton>
        <div
          style={{
            width: '100%',
            padding: '2rem 0',
          }}
        >
          {contents}
        </div>
      </SignInCard>
    </Flow.Part>
  );
};
