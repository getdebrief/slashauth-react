import { useEffect } from 'react';
import { useEnvironment } from '../../context/environment';
import {
  LoginMethodsProvider,
  useLoginMethods,
} from '../../context/login-methods';
import { Route } from '../../router/route';
import { Switch } from '../../router/switch';
import { SignInProps } from '../../types/ui-components';
import { Flow } from '../flow/flow';
import { ComponentContext } from './context';
import { SignInWeb3 } from './sign-in-web3';
import { SignInStart } from './start';

function SignInRoutes(): JSX.Element {
  const environment = useEnvironment();
  const { setLoginMethods } = useLoginMethods();

  useEffect(() => {
    setLoginMethods(environment.authSettings.availableWeb3LoginMethods);
  }, [environment.authSettings, setLoginMethods]);

  return (
    <Flow.Root flow="sign-in">
      <Switch>
        <Route path="web3">
          <SignInWeb3 />
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

  return (
    <Route path="sign-in">
      <ComponentContext.Provider
        value={{
          componentName: 'SignIn',
          ...signInProps,
          routing: 'virtual',
        }}
      >
        <LoginMethodsProvider>
          <SignInRoutes />
        </LoginMethodsProvider>
      </ComponentContext.Provider>
    </Route>
  );
};
