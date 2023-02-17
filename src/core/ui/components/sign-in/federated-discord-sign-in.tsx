import { useEffect } from 'react';
import { Flow } from '../flow/flow';
import { useCoreClient } from '../../context/slashauth-client';
import { useRouter } from '../../router/context';
import { useSignInContext } from './context';
import { useInteraction } from '../../context/interaction';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { LoadingScreen } from './screens/loading';

export const FederatedDiscordSignIn = () => {
  const slashAuth = useCoreSlashAuth();
  const { setProcessing } = useInteraction();
  const { connectAccounts } = useSignInContext();
  const { navigate } = useRouter();
  const client = useCoreClient();

  useEffect(() => {
    client
      .discordLogin({
        connectAccounts,
      })
      .then((resp) => {
        slashAuth
          .checkLoginState()
          .then(() => {
            navigate('../success');
          })
          .catch(() => {
            navigate('../error');
          })
          .finally(() => {
            setProcessing(false);
          });
      })
      .catch(() => {
        navigate('../error');
        setProcessing(false);
      });
    setProcessing(true);
    return () => setProcessing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // When processing display loader
    <Flow.Part part="federatedDiscord">
      <LoadingScreen
        description="Connecting to Discord"
        detailedDescription="Confirm your account connection"
        navigateBack={async () => {
          setProcessing(false);
          navigate('../');
        }}
      />
    </Flow.Part>
  );
};
