import { withCardStateProvider } from '../../context/card';
import { Flow } from '../flow/flow';
import { SignInCard } from './card';

const _SignInSuccess = () => {
  return (
    <Flow.Part part="complete">
      <SignInCard>
        <div style={{ margin: '1rem 0', padding: '2rem' }}>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>
            You're successfully signed in! 🎉
          </p>
        </div>
      </SignInCard>
    </Flow.Part>
  );
};

export const SignInSuccess = withCardStateProvider(_SignInSuccess);
