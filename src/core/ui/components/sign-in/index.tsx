import { useMemo } from 'react';
import { useAppearance } from '../../context/appearance';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useEnvironment } from '../../context/environment';
import {
  LoginMethod,
  LoginMethodsProvider,
  LoginMethodType,
  Web3LoginMethod,
} from '../../context/login-methods';
import { useUser } from '../../context/user';
import { Web3LoginStateProvider } from '../../context/web3-signin';
import { Route } from '../../router/route';
import { Switch } from '../../router/switch';
import { SignInProps } from '../../types/ui-components';
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
  const {
    viewOnly,
    walletConnectOnly,
    connectAccounts,
    loginMethodConfigOverride,
  } = useSignInContext();
  const slashAuth = useCoreSlashAuth();

  // TODO: Refactor this so we use the same codepath as in core/slashauth.
  const web3LoginMethods = useMemo(() => {
    if (!viewOnly || !loginMethodConfigOverride) {
      return environment.authSettings.availableWeb3LoginMethods;
    }

    return slashAuth.manager.connectors
      .map((connector) => {
        if (loginMethodConfigOverride.web3.eth) {
          switch (connector.id) {
            case 'metaMask':
              if (!loginMethodConfigOverride.web3.eth.metamask.enabled) {
                return null;
              }
              break;
            default:
              if (
                loginMethodConfigOverride.web3.eth[connector.id] &&
                !loginMethodConfigOverride.web3.eth[connector.id].enabled
              ) {
                return null;
              }
          }
        }
        return {
          id: connector.id,
          name: connector.name,
          type: 'web3',
          chain: 'eth',
          ready: connector.ready,
        };
      })
      .filter((connector) => connector !== null) as Web3LoginMethod[];
  }, [
    environment.authSettings.availableWeb3LoginMethods,
    loginMethodConfigOverride,
    slashAuth.manager.connectors,
    viewOnly,
  ]);

  const web2LoginMethods = useMemo(() => {
    if (!viewOnly || !loginMethodConfigOverride) {
      return environment.authSettings.availableWeb2LoginMethods;
    }

    const resp: LoginMethod[] = [];
    if (loginMethodConfigOverride.web2.enabled) {
      if (loginMethodConfigOverride.web2.magicLink?.enabled) {
        resp.push({
          id: 'magic-link',
          type: LoginMethodType.MagicLink,
          name: 'Magic Link',
          ready: true,
        });
      }
    }
    return resp;
  }, [
    environment.authSettings.availableWeb2LoginMethods,
    loginMethodConfigOverride,
    viewOnly,
  ]);

  if (viewOnly) {
    return (
      <Web3LoginStateProvider manager={slashAuth.manager}>
        <LoginMethodsProvider
          loginMethods={[...web3LoginMethods, ...web2LoginMethods]}
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
