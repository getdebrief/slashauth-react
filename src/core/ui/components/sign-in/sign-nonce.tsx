import { useCallback, useEffect, useState } from 'react';
import { useAppearance } from '../../context/appearance';
import { withCardStateProvider } from '../../context/card';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useDeviceContext } from '../../context/device-id';
import { useCoreClient } from '../../context/slashauth-client';
import { useWeb3LoginState } from '../../context/web3-signin';
import { useRouter } from '../../router/context';
import { Flow } from '../flow/flow';
import { Flex } from '../primitives/container';
import { Loader } from '../primitives/loader';
import { useSignInContext } from './context';
import { Content, Section } from './layout/content';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { ActionScreen } from './screens/action';
import { LoadingScreen } from './screens/loading';

const _SignNonce = () => {
  const { connectAccounts } = useSignInContext();
  const [fetchedNonce, setFetchedNonce] = useState<string | null>(null);
  const slashAuth = useCoreSlashAuth();
  const { deviceID } = useDeviceContext();
  const client = useCoreClient();
  const { address, web3Manager } = useWeb3LoginState();
  const { navigate } = useRouter();

  const [fetchingNonce, setFetchingNonce] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginWithAPIActive, setLoginWithAPIActive] = useState(false);

  useEffect(() => {
    setFetchedNonce(null);
  }, [address, deviceID]);

  const handleFetchNonce = useCallback(async () => {
    if (fetchingNonce || !address || !deviceID || !client) {
      return;
    }
    setFetchingNonce(true);
    try {
      const nonceToSign = await client.getNonceToSign({ address, deviceID });
      setFetchedNonce(nonceToSign);
      return nonceToSign;
    } finally {
      setFetchingNonce(false);
    }
  }, [address, client, deviceID, fetchingNonce]);

  useEffect(() => {
    if (!fetchedNonce) {
      handleFetchNonce();
    }
  }, [fetchedNonce, handleFetchNonce]);

  const signNonceAndLogin = useCallback(async () => {
    if (loggingIn) {
      console.error('currently logging in. Check metamask');
      return;
    }
    setLoggingIn(true);
    try {
      let signature: string | undefined = undefined;
      try {
        signature = await web3Manager.signer.signMessage(fetchedNonce);
      } catch (err) {
        // If this errors, the user has rejected the signature.
        console.error('User rejected the signature');
        navigate('../error');
        return;
      }
      if (signature) {
        try {
          setLoginWithAPIActive(true);
          await client.walletLoginInPage({
            address,
            signature: signature,
            connectAccounts,
          });
          slashAuth.checkLoginState();
        } catch (err) {
          navigate(
            `../error?error=${err.error}&error_description=${err.error_description}`
          );
          return;
        } finally {
          setLoginWithAPIActive(false);
        }
        navigate('../success');
      } else {
        navigate('../error');
      }
    } finally {
      setLoggingIn(false);
    }
  }, [
    address,
    client,
    connectAccounts,
    fetchedNonce,
    loggingIn,
    navigate,
    slashAuth,
    web3Manager.signer,
  ]);

  const appearance = useAppearance();

  if (!fetchedNonce) {
    return (
      <>
        <Header title="Confirm Connection" />
        <Content>
          <Section>
            <Flex gap={8} alignItems="center" justifyContent="center">
              <Loader color={appearance.modalStyle.fontColor} size={8} />
            </Flex>
          </Section>
        </Content>
        <Footer />
      </>
    );
  }

  if (loginWithAPIActive)
    return (
      <LoadingScreen
        loading
        description="Logging in..."
        detailedDescription=""
        navigateBack={() => navigate('../')}
      />
    );

  if (loggingIn)
    return (
      <LoadingScreen
        description="Sign Message"
        detailedDescription="Please sign the message in your wallet app or plugin to continue."
        navigateBack={() => navigate('../')}
      />
    );

  return (
    <Flow.Part part="sign-nonce">
      <ActionScreen
        navigateBack={() => navigate('../')}
        signNonceAndLogin={signNonceAndLogin}
      />
    </Flow.Part>
  );
};

export const SignNonce = withCardStateProvider(_SignNonce);
