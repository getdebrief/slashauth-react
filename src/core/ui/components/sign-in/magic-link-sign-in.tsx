import { useCallback, useState } from 'react';
import { validate } from 'email-validator';
import styleModule from './magic-link-sign-in.module.css';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';
import { PrimaryButton } from '../primitives/button';
import { useAppearance } from '../../context/appearance';

export const MagicLinkSignIn = () => {
  const appearance = useAppearance();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = useCallback(() => {
    if (!validate(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  }, [email]);

  return (
    <Flow.Part part="emailLink">
      <SignInCard showBackButton>
        <div
          style={{
            width: '100%',
            padding: '2rem 0',
          }}
        >
          <h2
            style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: 500 }}
          >
            Enter your email below and we will email you a link to login.
          </h2>
          <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 700 }}>
            Email:
          </label>
          <div
            style={{
              marginTop: '0.25rem',
              marginBottom: '1rem',
              width: '100%',
            }}
          >
            <input
              style={{
                ...(emailError ? { border: '1px solid #FF4D4F' } : {}),
              }}
              type="email"
              name="email"
              className={styleModule.input}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              onBlur={validateEmail}
              onFocus={() => setEmailError(null)}
            />
          </div>
          <PrimaryButton onClick={() => console.log('click')}>
            Send a magic link
          </PrimaryButton>
          {emailError && <div className={styleModule.error}>{emailError}</div>}
        </div>
      </SignInCard>
    </Flow.Part>
  );
};
