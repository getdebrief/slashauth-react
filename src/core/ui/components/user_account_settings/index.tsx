import { Route } from '../../router/route';
import { useRouter } from '../../router/context';
import { EditNameScreen } from './screens/edit_name';
import { SummaryScreen } from './screens/summary';
import { Wrapper } from './layout/wrapper';
import { VirtualRouter } from '../../router/virtual';
import { useFetchMyAccountSettings } from './useFetchMyAccountSettings';

export const UserAccountSettings = withVirtualRouter(() => {
  const myAccountSettings = useFetchMyAccountSettings();
  const router = useRouter();

  return (
    <Wrapper>
      <Route path="name">
        <EditNameScreen
          backToSettings={() => router.navigate('')}
          save={console.log}
        />
      </Route>
      <Route index>
        <SummaryScreen accountSettings={myAccountSettings} />
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
