import { useCallback, useEffect, useMemo, useState } from 'react';
import { GenericError } from '../../../../shared/errors';
import { shortenEthAddress } from '../../../../shared/utils/eth';
import { withCardStateProvider } from '../../context/card';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useDeviceContext } from '../../context/device-id';
import { useCoreClient } from '../../context/slashauth-client';
import { useWeb3LoginState } from '../../context/web3-signin';
import { useRouter } from '../../router/context';
import { Flow } from '../flow/flow';
import { PrimaryButton, SecondaryButton } from '../primitives/button';
import { SignInCard } from './card';
import { useSignInContext } from './context';
import { LoadingModalContents } from './loading';

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

  const contents = useMemo(() => {
    if (!fetchedNonce && (fetchingNonce || !address || !deviceID)) {
      return <LoadingModalContents />;
    }
    if (!fetchedNonce) {
      handleFetchNonce();
      return <LoadingModalContents />;
    }
    if (loginWithAPIActive) {
      return <LoadingModalContents />;
    }
    if (loggingIn) {
      return (
        <div style={{ margin: '2rem 0' }}>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>
            Sign the message with your wallet to continue
          </p>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              textAlign: 'left',
              marginTop: '0.75rem',
            }}
          >
            Check your wallet app or plugin (e.g. metamask, coinbase) to
            continue logging in.
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          margin: '2rem 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: '1',
        }}
      >
        <p style={{ fontSize: '16px', fontWeight: 500 }}>
          You have connected wallet with address{' '}
          <span style={{ fontWeight: '700' }}>
            {shortenEthAddress(address)}
          </span>
        </p>
        <div
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <PrimaryButton onClick={() => signNonceAndLogin()}>
            Continue
          </PrimaryButton>
          <div style={{ height: '0.5rem' }} />
          <SecondaryButton onClick={() => navigate('../')}>
            Sign in with another wallet
          </SecondaryButton>
        </div>
      </div>
    );
  }, [
    address,
    fetchedNonce,
    handleFetchNonce,
    loggingIn,
    loginWithAPIActive,
    navigate,
    signNonceAndLogin,
  ]);

  return (
    <Flow.Part part="sign-nonce">
      <SignInCard>{contents}</SignInCard>
    </Flow.Part>
  );
};

export const SignNonce = withCardStateProvider(_SignNonce);
