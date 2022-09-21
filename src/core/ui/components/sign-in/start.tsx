import { withCardStateProvider } from '../../context/card';
import { Flow } from '../flow/flow';
import { SignInWeb3Buttons } from './sign-in-web3-buttons';
import { SignInCard } from './card';

const _SignInStart = () => {
  return (
    <Flow.Part part="start">
      <SignInCard>
        <div
          className="slashauth-modal-scrollable"
          style={{
            overflowY: 'hidden',
            width: '100%',
            marginTop: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'start',
                }}
              >
                Connect your wallet:
              </p>
            </div>
            <SignInWeb3Buttons />
          </div>
        </div>
      </SignInCard>
    </Flow.Part>
  );
};

export const SignInStart = withCardStateProvider(_SignInStart);
