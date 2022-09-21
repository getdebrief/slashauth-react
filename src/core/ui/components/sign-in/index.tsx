import { useEffect } from 'react';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useEnvironment } from '../../context/environment';
import {
  LoginMethodsProvider,
  useLoginMethods,
} from '../../context/login-methods';
import { useUser } from '../../context/user';
import { Web3LoginStateProvider } from '../../context/web3-signin';
import { Route } from '../../router/route';
import { Switch } from '../../router/switch';
import { SignInProps } from '../../types/ui-components';
import { Flow } from '../flow/flow';
import { ComponentContext, useSignInContext } from './context';
import { SignNonce } from './sign-nonce';
import { SignInStart } from './start';
import { SignInSuccess } from './success';

function SignInRoutes(): JSX.Element {
  const environment = useEnvironment();
  const user = useUser();
  const { setLoginMethods } = useLoginMethods();
  const { walletConnectOnly } = useSignInContext();

  useEffect(() => {
    setLoginMethods(environment.authSettings.availableWeb3LoginMethods);
  }, [environment.authSettings, setLoginMethods]);

  if (user.loggedIn) {
    return <SignInSuccess />;
  }

  return (
    <Flow.Root flow="sign-in">
      <Switch>
        {!walletConnectOnly && (
          <Route path="sign-nonce">
            <SignNonce />
          </Route>
        )}
        <Route path="success">
          <SignInSuccess />
        </Route>
        <Route index>
          <SignInStart />
        </Route>
      </Switch>
    </Flow.Root>
  );
}

export const SignInModal = (props: SignInProps): JSX.Element => {
  const signInProps = {
    ...props,
  };

  const slashAuth = useCoreSlashAuth();

  return (
    <Route path="sign-in">
      <ComponentContext.Provider
        value={{
          componentName: 'SignIn',
          ...signInProps,
          routing: 'virtual',
        }}
      >
        <Web3LoginStateProvider manager={slashAuth.manager}>
          <LoginMethodsProvider>
            <SignInRoutes />
          </LoginMethodsProvider>
        </Web3LoginStateProvider>
      </ComponentContext.Provider>
    </Route>
  );
};
