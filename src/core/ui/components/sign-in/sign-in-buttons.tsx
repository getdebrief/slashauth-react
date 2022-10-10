import { useMemo } from 'react';
import {
  LoginMethod,
  LoginMethodType,
  useLoginMethods,
  Web3LoginMethod,
} from '../../context/login-methods';
import { useUser } from '../../context/user';
import { useRouter } from '../../router/context';
import { useSignInContext } from './context';
import { SignInWeb2Buttons } from './sign-in-web2-buttons';
import { SignInWeb3Buttons } from './sign-in-web3-buttons';
import localStyles from './styles.module.css';

/**
 * We have different configuration methods:
 * 1. If only wallets are enabled, show all of the wallets with a scroll.
 * 2. If multiple wallets AND at least 1 web2 login, show the first wallet, then a show more button.
 * 3. If only web2 methods, show them as icons.
 */

type Props = {
  showAllWallets?: boolean;
  onClick: (loginMethod: LoginMethod) => void;
};

export const SignInButtons = ({ showAllWallets, onClick }: Props) => {
  const { excludeLoginMethodTypes, includeLoginMethodTypes, viewOnly } =
    useSignInContext();
  const user = useUser();
  const enabledLoginMethods = useLoginMethods();

  const web3LoginMethods = useMemo(() => {
    if (!viewOnly && user && user.loginMethods.includes(LoginMethodType.Web3)) {
      // User is already logged in using web3 so we should not expose this.
      return [];
    }

    if (
      excludeLoginMethodTypes &&
      excludeLoginMethodTypes.includes(LoginMethodType.Web3)
    ) {
      return [];
    }

    if (
      includeLoginMethodTypes &&
      !includeLoginMethodTypes.includes(LoginMethodType.Web3)
    ) {
      return [];
    }

    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type === LoginMethodType.Web3
    ) as unknown as Web3LoginMethod[];
  }, [
    enabledLoginMethods.loginMethods,
    excludeLoginMethodTypes,
    includeLoginMethodTypes,
    user,
    viewOnly,
  ]);

  const web2LoginMethods = useMemo(() => {
    const loggedInMethods = user?.loginMethods || [];

    return enabledLoginMethods.loginMethods.filter(
      (m) =>
        m.type !== LoginMethodType.Web3 &&
        (viewOnly || !loggedInMethods.includes(m.type)) &&
        (!excludeLoginMethodTypes ||
          !excludeLoginMethodTypes.includes(m.type)) &&
        (!includeLoginMethodTypes || includeLoginMethodTypes.includes(m.type))
    ) as unknown as Web3LoginMethod[];
  }, [
    enabledLoginMethods.loginMethods,
    excludeLoginMethodTypes,
    includeLoginMethodTypes,
    user?.loginMethods,
    viewOnly,
  ]);

  if (web3LoginMethods.length && (showAllWallets || !web2LoginMethods.length)) {
    // We want to return just the web3 login methods.
    return <SignInWeb3Buttons showMoreAfter={-1} onClick={onClick} />;
  } else if (web3LoginMethods.length && web2LoginMethods.length) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SignInWeb3Buttons showMoreAfter={1} onClick={onClick} />
        <div className={localStyles.textDivider}>or</div>
        <SignInWeb2Buttons onClick={onClick} />
      </div>
    );
  } else {
    return <SignInWeb2Buttons onClick={onClick} />;
  }
};
