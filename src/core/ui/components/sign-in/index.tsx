import { useAppearance } from '../../context/appearance';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useEnvironment } from '../../context/environment';
import { LoginMethodsProvider } from '../../context/login-methods';
import { useUser } from '../../context/user';
import { Web3LoginStateProvider } from '../../context/web3-signin';
import { Route } from '../../router/route';
import { Switch } from '../../router/switch';
import { SignInProps } from '../../types/ui-components';
import { ErrorBoundary } from '../error-boundary';
import { Flow } from '../flow/flow';
import { ModalContent } from '../modal/modal-content';
import { ComponentContext, useSignInContext } from './context';
import { SignInError } from './error';
import { MagicLinkSignIn } from './magic-link-sign-in';
import { SignNonce } from './sign-nonce';
import { SignInStart } from './start';
import { SignInSuccess } from './success';

function SignInRoutes(): JSX.Element {
  const environment = useEnvironment();
  const user = useUser();
  const { viewOnly, walletConnectOnly, connectAccounts } = useSignInContext();
  const slashAuth = useCoreSlashAuth();

  if (viewOnly) {
    return (
      <Web3LoginStateProvider manager={slashAuth.manager}>
        <LoginMethodsProvider
          loginMethods={[
            ...environment.authSettings.availableWeb3LoginMethods,
            ...environment.authSettings.availableWeb2LoginMethods,
          ]}
        >
          <Flow.Root flow="sign-in">
            <Route index>
              <SignInStart />
            </Route>
          </Flow.Root>
        </LoginMethodsProvider>
      </Web3LoginStateProvider>
    );
  }

  return (
    <Web3LoginStateProvider manager={slashAuth.manager}>
      <LoginMethodsProvider
        loginMethods={[
          ...environment.authSettings.availableWeb3LoginMethods,
          ...environment.authSettings.availableWeb2LoginMethods,
        ]}
      >
        <Flow.Root flow="sign-in">
          {user.loggedIn && !connectAccounts ? (
            <SignInSuccess />
          ) : (
            <Switch>
              {!walletConnectOnly && (
                <Route path="sign-nonce">
                  <SignNonce />
                </Route>
              )}
              <Route path="success">
                <SignInSuccess />
              </Route>
              <Route path="error">
                <SignInError />
              </Route>
              <Route path="all-wallets">
                <SignInStart showAllWallets showBackButton />
              </Route>
              <Route path="magic-link">
                <MagicLinkSignIn />
              </Route>
              <Route index>
                <SignInStart />
              </Route>
            </Switch>
          )}
        </Flow.Root>
      </LoginMethodsProvider>
    </Web3LoginStateProvider>
  );
}

export const SignIn: React.ComponentType<SignInProps> = () => {
  const appearance = useAppearance();

  return (
    <ModalContent modalStyles={appearance.modalStyle}>
      <SignInRoutes />
    </ModalContent>
  );
};

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
        <SignInRoutes />
      </ComponentContext.Provider>
    </Route>
  );
};
