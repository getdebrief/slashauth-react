import { useCardState, withCardStateProvider } from '../../context/card';
import { useFlowMetadata } from '../../context/flow';
import { Alert } from '../alert';
import { Card } from '../card';
import { Flow } from '../flow/flow';
import { Header } from '../header';
import { FlexCol } from '../primitives/flex';
import { SignInWeb3Buttons } from './sign-in-web3-buttons';

const _SignInStart = () => {
  const flow = useFlowMetadata();

  return (
    <Flow.Part part="start">
      <Card>
        <Header.Root>
          <Header.Title>Sign In</Header.Title>
          <Header.Subtitle>Login to get access</Header.Subtitle>
        </Header.Root>
        <FlexCol>
          <SignInWeb3Buttons />
        </FlexCol>
      </Card>
    </Flow.Part>
  );
};

export const SignInStart = withCardStateProvider(_SignInStart);
