import { useMemo } from 'react';
import { useAppearance } from '../../context/appearance';
import {
  LoginMethodType,
  useLoginMethods,
  Web3LoginMethod,
} from '../../context/login-methods';
import { useRouter } from '../../router/context';
import { PrimaryButton } from '../primitives/button';
import { WalletConnectorButton } from './web3-login-button';
import { SignInCard } from './card';

export const SignInError = () => {
  const { navigate, queryParams } = useRouter();
  const { selectedLoginMethod } = useLoginMethods();
  const appearance = useAppearance();

  const loginMethod = useMemo(() => {
    if (
      selectedLoginMethod &&
      selectedLoginMethod.type === LoginMethodType.Web3
    ) {
      return (
        <div>
          <p
            style={{
              fontSize: '14px',
              color: appearance.modalStyle.fontColor,
              fontWeight: 400,
            }}
          >
            You tried logging in with:
          </p>
          <WalletConnectorButton
            loginMethod={selectedLoginMethod as Web3LoginMethod}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClick={() => {}}
          />
        </div>
      );
    }
    return <div />;
  }, [appearance.modalStyle.fontColor, selectedLoginMethod]);

  const errorDiv = useMemo(() => {
    if (queryParams.error) {
      if (queryParams.error === 'login_already_used') {
        return (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '16px', fontWeight: 500, color: 'red' }}>
              That login method is associated with another user.
            </p>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '9B9B9B',
                marginTop: '4px',
              }}
            >
              A wallet or email can only be connected to one user at a time.
            </p>
          </div>
        );
      }
    }

    return (
      <div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: 'red' }}>
          Failed to login. Please try again.
        </p>
        {loginMethod}
      </div>
    );
  }, [loginMethod, queryParams]);

  return (
    <SignInCard>
      <div
        style={{
          margin: '2rem 0',
          flexGrow: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {errorDiv}
        <div>
          <PrimaryButton onClick={() => navigate('../')}>
            Try Again
          </PrimaryButton>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              textAlign: 'left',
              marginTop: '0.75rem',
              color: '#9B9B9B',
            }}
          >
            If you continue to have issues, please contact us at{' '}
            <a style={{ color: '#577EFD' }} href="mailto:support@slashauth.com">
              support@slashauth.com
            </a>
            .
          </p>
        </div>
      </div>
    </SignInCard>
  );
};
