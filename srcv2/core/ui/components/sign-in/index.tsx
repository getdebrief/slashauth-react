import { Route } from '../../router/route';
import { Switch } from '../../router/switch';
import { VIRTUAL_ROUTER_BASE_PATH } from '../../router/virtual';
import { SignInProps } from '../../types/ui-components';
import { Flow } from '../flow/flow';
import { ComponentContext, useSignInContext } from './context';
import { SignInWeb3 } from './sign-in-web3';
import { SignInStart } from './start';

function SignInRoutes(): JSX.Element {
  const signInContext = useSignInContext();

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
    signUpUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-up`,
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
        <div>
          <SignInRoutes />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
