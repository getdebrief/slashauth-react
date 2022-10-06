import { useCallback, useMemo, useState } from 'react';
import { validate } from 'email-validator';
import styleModule from './magic-link-sign-in.module.css';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';
import { PrimaryButton } from '../primitives/button';
import { LoadingModalContents } from './loading';
import useIsMounted from '../../../../shared/hooks/use-is-mounted';
import { useCoreClient } from '../../context/slashauth-client';
import { useRouter } from '../../router/context';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useSignInContext } from './context';

export const MagicLinkSignIn = () => {
  const { connectAccounts } = useSignInContext();
  const slashAuth = useCoreSlashAuth();
  const { navigate } = useRouter();
  const mounted = useIsMounted();
  const client = useCoreClient();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = useCallback(() => {
    if (!validate(email)) {
      setError('Please enter a valid email address');
    } else {
      setError(null);
    }
  }, [email]);

  const handleClick = useCallback(async () => {
    if (!validateEmail) {
      return;
    }
    try {
      setSubmitting(true);
      await client.magicLinkLogin({
        email,
        connectAccounts,
      });
      await slashAuth.checkLoginState();
      navigate('../success');
    } catch (err) {
      if (mounted()) {
        setError(err.toString());
      }
    } finally {
      if (mounted()) {
        setSubmitting(false);
      }
    }
  }, [
    client,
    connectAccounts,
    email,
    mounted,
    navigate,
    slashAuth,
    validateEmail,
  ]);

  const contents = useMemo(() => {
    if (!submitting) {
      return (
        <>
          <h2
            style={{
              marginBottom: '2rem',
              fontSize: '16px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Enter your email below and we will send you a link to login.
          </h2>
          <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 700 }}>
            Email:
          </label>
          <div
            style={{
              marginTop: '0.25rem',
              marginBottom: '1rem',
              padding: '0 2px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <input
              type="email"
              name="email"
              className={styleModule.input}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              onBlur={validateEmail}
              onFocus={() => setError(null)}
            />
          </div>
          <PrimaryButton onClick={() => handleClick()}>
            Send a magic link
          </PrimaryButton>
          {error && <div className={styleModule.error}>{error}</div>}
        </>
      );
    }
    return (
      <LoadingModalContents
        textContent={'Check your email and click the link to login'}
      />
    );
  }, [email, error, handleClick, submitting, validateEmail]);

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
