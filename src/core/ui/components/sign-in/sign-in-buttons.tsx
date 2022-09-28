import { MailIcon } from '@heroicons/react/outline';
import { useMemo } from 'react';
import {
  LoginMethod,
  LoginMethodType,
  useLoginMethods,
  Web3LoginMethod,
} from '../../context/login-methods';
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
  const enabledLoginMethods = useLoginMethods();

  const web3LoginMethods = useMemo(() => {
    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type === LoginMethodType.Web3
    ) as unknown as Web3LoginMethod[];
  }, [enabledLoginMethods.loginMethods]);

  const web2LoginMethods = useMemo(() => {
    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type !== LoginMethodType.Web3
    ) as unknown as Web3LoginMethod[];
  }, [enabledLoginMethods.loginMethods]);

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
  }

  return <div />;
};
