import { Route } from '../../router/route';
import { useRouter } from '../../router/context';
import { EditNameScreen } from './screens/edit_name';
import { SummaryScreen } from './screens/summary';
import { Wrapper } from './layout/wrapper';
import { VirtualRouter } from '../../router/virtual';
import { useSlashauthClientUserAccountSettings } from './useSlashauthClientUserAccountSettings';
import { useCallback } from 'react';
import { LoginMethodType } from '../../context/login-methods';

export const UserAccountSettings = withVirtualRouter(() => {
  const {
    accountSettings,
    patchAccountSettings,
    removeConnection,
    addConnection,
  } = useSlashauthClientUserAccountSettings();
  const router = useRouter();

  const addEmail = useCallback(() => {
    addConnection([LoginMethodType.FederatedGoogle, LoginMethodType.MagicLink]);
  }, [addConnection]);

  const addWallet = useCallback(() => {
    addConnection([LoginMethodType.Web3]);
  }, [addConnection]);

  // const addWeb2Account = useCallback(() => {
  //   openSignIn({
  //     connectAccounts: true,
  //     includeLoginMethodTypes: [
  //       LoginMethodType.FederatedDiscord,
  //       LoginMethodType.FederatedTwitter,
  //     ],
  //   });
  //   return;
  // }, [openSignIn]);

  return (
    <Wrapper>
      <Route path="name">
        <EditNameScreen
          backToSettings={() => router.navigate('')}
          save={(name) => patchAccountSettings({ name })}
        />
      </Route>
      <Route index>
        <SummaryScreen
          accountSettings={accountSettings}
          removeConnection={removeConnection}
          editProfilePicture={console.log}
          addEmail={addEmail}
          addWallet={addWallet}
        />
      </Route>
    </Wrapper>
  );
});

function withVirtualRouter(Component) {
  return (props) => (
    <VirtualRouter startPath="">
      <Component {...props} />
    </VirtualRouter>
  );
}
