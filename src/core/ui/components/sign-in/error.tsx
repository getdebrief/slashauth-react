import { useRouter } from '../../router/context';
import { PrimaryButton } from '../primitives/button';
import { SignInCard } from './card';

export const SignInError = () => {
  const { navigate } = useRouter();

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
        <div>
          <p style={{ fontSize: '16px', fontWeight: 500, color: 'red' }}>
            Failed to login. Please try again.
          </p>
          <PrimaryButton onClick={() => navigate('../')}>
            Try Again
          </PrimaryButton>
        </div>
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
          <a href="mailto:support@slashauth.com">support@slashauth.com</a>.
        </p>
      </div>
    </SignInCard>
  );
};
