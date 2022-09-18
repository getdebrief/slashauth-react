import {
  useWeb3LoginState,
  withWeb3LoginStateProvider,
} from '../../context/web3-signin';

const _SignInWeb3 = () => {
  const { loginMethod, address, nonce, signature } = useWeb3LoginState();

  if (!address) {
    return <div>Need address</div>;
  }

  return <div>Seems like everything worked out!</div>;
};

export const SignInWeb3 = withWeb3LoginStateProvider(_SignInWeb3);
