import { useCardState } from '../../context/card';
import { Alert } from '../alert';
import { Card } from '../card';
import { Flow } from '../flow/flow';
import { Header } from '../header';
import { FlexCol } from '../primitives/flex';
import { SignInWeb3Buttons } from './sign-in-web3-buttons';

export const SignInStart = () => {
  const card = useCardState();

  return (
    <Flow.Part part="start">
      <Card>
        <Alert>{card.error}</Alert>
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
