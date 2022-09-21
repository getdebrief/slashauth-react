import { useCallback, useMemo, useState } from 'react';
import { shortenEthAddress } from '../../../../shared/utils/eth';
import { withCardStateProvider } from '../../context/card';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useDeviceContext } from '../../context/device-id';
import { useCoreClient } from '../../context/slashauth-client';
import { useWeb3LoginState } from '../../context/web3-signin';
import { useRouter } from '../../router/context';
import { Card } from '../card';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';

const _SignNonce = () => {
  const slashAuth = useCoreSlashAuth();
  const { deviceID } = useDeviceContext();
  const client = useCoreClient();
  const { address, web3Manager } = useWeb3LoginState();
  const { navigate } = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleFetchNonce = useCallback(async () => {
    const nonceToSign = await client.getNonceToSign({ address, deviceID });
    return nonceToSign;
  }, [address, client, deviceID]);

  const signNonceAndLogin = useCallback(async () => {
    if (loggingIn) {
      console.error('current logging in. Check metamask');
      return;
    }
    setLoggingIn(true);
    try {
      const nonceToSign = await handleFetchNonce();
      let signature: string | undefined = undefined;
      try {
        signature = await web3Manager.signer.signMessage(nonceToSign);
      } catch (err) {
        // If this errors, the user has rejected the signature.
        console.error('User rejected the signature');
        // TODO: update the state.
        return;
      }
      if (signature) {
        try {
          await client.walletLoginInPage({
            address,
            signature,
          });
          slashAuth.checkLoginState();
        } catch (err) {
          console.error('Failed to login: ', err);
          // TODO: Show failure state.
          return;
        }
        navigate('../success');
      }
    } finally {
      setLoggingIn(false);
    }
  }, [
    address,
    client,
    handleFetchNonce,
    loggingIn,
    navigate,
    slashAuth,
    web3Manager.signer,
  ]);

  const contents = useMemo(() => {
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
        style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column' }}
      >
        <p style={{ fontSize: '16px', fontWeight: 500 }}>
          You have connected wallet with address{' '}
          <span style={{ fontWeight: '700' }}>
            {shortenEthAddress(address)}
          </span>
        </p>
        <button onClick={() => signNonceAndLogin()}>Continue login</button>
        <button onClick={() => navigate('../')}>
          Sign in with another wallet
        </button>
      </div>
    );
  }, [address, loggingIn, navigate, signNonceAndLogin]);

  return (
    <Flow.Part part="sign-nonce">
      <SignInCard>{contents}</SignInCard>
    </Flow.Part>
  );
};

export const SignNonce = withCardStateProvider(_SignNonce);
