import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { shortenEthAddress } from '../../../../shared/utils/eth';
import { profilePicturePlaceholder } from './icons/profilePicturePlaceholder';
import { chevronDown } from './icons/chevronDown';
import { copyIcon } from './icons/copyIcon';
import { gearIcon } from './icons/gearIcon';
import { CheckMarkIcon } from '../icon/check_mark';
import { logoutIcon } from './icons/logoutIcon';
import { Content } from './content';
import { Row } from './row';
import { Section } from './section';
import { Icon } from './icon';
import { primaryIdStyle } from './primaryID';
import styles from './styles.module.css';
import { SlashAuth } from '../../../slashauth';
import { classNames } from '../../../../shared/utils/classnames';
import { twitterIcon } from './icons/twitterIcon';
import { MailIcon } from '@heroicons/react/outline';
import { LoginMethodType } from '../../context/login-methods';
import { useEnvironment } from '../../context/environment';
import { User } from '../../../user';
import { EthLogo } from '../icon/ethereum-eth-logo';

const MANAGE_ACCOUNT_ENABLED = false;

type Context = Pick<
  SlashAuth,
  'openSignIn' | 'logout' | 'isReady' | 'connectWallet'
> & {
  appName: string;
  user: User;
};

type Props = {
  context: Context;
};

export const Inner = ({ context }: Props) => {
  const { authSettings } = useEnvironment();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isReady, logout, openSignIn, appName, user } = context;

  const [loggedInCopyText, loggedInButtonDisplay] = useMemo(() => {
    const loginType = user.loginType;
    const loginIdentifier = user.loginIdentifier;
    if (loginType === LoginMethodType.Web3 && loginIdentifier) {
      const address = loginIdentifier;
      if (address) {
        const walletDisplay = shortenEthAddress(address);
        return [address, walletDisplay];
      }
    }
    if (
      [LoginMethodType.MagicLink, LoginMethodType.FederatedGoogle].includes(
        loginType
      ) &&
      loginIdentifier
    ) {
      const emailParts = loginIdentifier.split('@');
      if (emailParts.length === 1) {
        // There is `@` in the email so we can't shorten it.
        return [user.email, user.email];
      }
      let prefix = emailParts[0];
      if (prefix.length > 6) {
        prefix = `${prefix.slice(0, 3)}...${prefix.slice(-3)}`;
      }
      return [user.email, `${prefix}@${emailParts[1]}`];
    }
    return ['SlashAuth User', 'SlashAuth User'];
  }, [user]);

  // if a click occurs outside the element, close it
  const ref = useRef();
  useEffect(() => {
    const listener = (evt: MouseEvent) => {
      if (!ref.current) return;
      const topDiv = ref.current;
      let targetEl = evt.target;
      do {
        if (targetEl === topDiv) {
          return;
        }
        // Go up the DOM
        targetEl = (targetEl as HTMLElement).parentNode;
      } while (targetEl);
      setIsOpen(false);
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);

  const handleConnectClick = useCallback(
    (includeMethodTypes: LoginMethodType[]) => {
      openSignIn({
        connectAccounts: true,
        includeLoginMethodTypes: includeMethodTypes,
      });
      return;
    },
    [openSignIn]
  );

  const manageAccountSection = useMemo(() => {
    if (MANAGE_ACCOUNT_ENABLED) {
      return (
        <Section>
          <Row
            onClick={() => {
              console.log('manage account');
            }}
          >
            <Icon>{gearIcon}</Icon>
            Manage account
          </Row>
        </Section>
      );
    }
    return <div />;
  }, []);

  const connectionsSection = useMemo(() => {
    const web2LoginMethods = authSettings.availableWeb2LoginMethods;

    if (!web2LoginMethods) {
      return <div />;
    }

    return (
      <Section>
        <div
          style={{
            padding: '4px 15px',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700 }}>
            Connected Accounts:
          </span>
        </div>
        {authSettings.availableWeb3LoginMethods.length > 0 && (
          <div
            className={styles.connectedAccountRow}
            onClick={() =>
              !user.wallet && handleConnectClick([LoginMethodType.Web3])
            }
          >
            <Icon style={{ height: '20px', width: '20px' }}>{EthLogo}</Icon>
            <span
              className={classNames(
                styles.connectedAccount,
                !user.wallet && styles.action
              )}
            >
              {user.wallet
                ? shortenEthAddress(user.wallet)
                : '+ Connect Wallet'}
            </span>
          </div>
        )}
        {!!web2LoginMethods.find(
          (lm) => lm.type === LoginMethodType.MagicLink
        ) && (
          <div
            className={styles.connectedAccountRow}
            onClick={() =>
              !user.email && handleConnectClick([LoginMethodType.MagicLink])
            }
          >
            <Icon style={{ height: '20px', width: '20px' }}>
              <MailIcon style={{ width: 18, height: 18, color: '#B6BCC8' }} />
            </Icon>
            <span
              className={classNames(
                styles.connectedAccount,
                !user.email && styles.action
              )}
            >
              {user.email || '+ Connect Email'}
            </span>
          </div>
        )}
        {!!web2LoginMethods.find(
          (lm) => lm.type === LoginMethodType.FederatedTwitter
        ) && (
          <div
            className={styles.connectedAccountRow}
            onClick={() =>
              !user.socials?.twitter &&
              handleConnectClick([LoginMethodType.FederatedTwitter])
            }
          >
            <Icon style={{ height: '20px', width: '20px' }}>{twitterIcon}</Icon>
            <span
              className={classNames(
                styles.connectedAccount,
                !user.socials?.twitter.handle && styles.action
              )}
            >
              {user.socials?.twitter.handle || '+ Connect Twitter'}
            </span>
          </div>
        )}
        {!!web2LoginMethods.find(
          (lm) => lm.type === LoginMethodType.FederatedGoogle
        ) && (
          <div
            className={styles.connectedAccountRow}
            onClick={() =>
              !user.socials?.google &&
              handleConnectClick([LoginMethodType.FederatedGoogle])
            }
          >
            <Icon style={{ height: '20px', width: '20px' }}>
              <img
                style={{
                  width: 15,
                }}
                alt="google icon"
                src={'https://cdn.cdnlogo.com/logos/g/35/google-icon.svg'}
              />
            </Icon>
            <span
              className={classNames(
                styles.connectedAccount,
                !user.socials?.google.email && styles.action
              )}
            >
              {user.socials?.google.email || '+ Connect Google Account'}
            </span>
          </div>
        )}
      </Section>
    );
  }, [
    authSettings.availableWeb2LoginMethods,
    authSettings.availableWeb3LoginMethods.length,
    handleConnectClick,
    user,
  ]);

  const loggedOutContent = (
    <div style={{ padding: '0px 15px 15px 15px' }}>
      <Section>
        <Row>
          <div
            style={{
              textAlign: 'left',
              fontSize: '14px',
              lineHeight: '20px',
            }}
          >
            Login to <strong>{appName}</strong> to view account settings
          </div>
        </Row>
      </Section>
      <Section>
        <div
          onClick={() => {
            openSignIn({});
            setIsOpen(false);
          }}
          style={{
            background: '#2F5FFC',
            color: 'white',
            padding: '6px 52px',
            fontWeight: 500,
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          Login to continue
        </div>
      </Section>
    </div>
  );

  const loggedInHeaderContent = useMemo(() => {
    let hashDisplayElement: JSX.Element = <div />;
    if (user.loggedIn) {
      hashDisplayElement = (
        <>
          <Row
            style={{
              display: 'flex',
              flexDirection: 'column',
              ...primaryIdStyle,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                lineHeight: '16px',
                fontWeight: 700,
                width: '100%',
                marginBottom: '6px',
              }}
            >
              {user.displayName || 'Logged in as:'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {loggedInButtonDisplay}
              <Icon
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={() => {
                  navigator.clipboard.writeText(loggedInCopyText);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
              >
                {copySuccess ? CheckMarkIcon : copyIcon}
              </Icon>
            </div>
          </Row>
        </>
      );
    }
    return hashDisplayElement;
  }, [copySuccess, loggedInButtonDisplay, loggedInCopyText, user]);

  if (!isReady()) return <ScaleLoader height={35} width={4} />;
  const loggedInContent = (
    <>
      <Section style={{ borderTop: 'none' }}>{loggedInHeaderContent}</Section>
      {connectionsSection}
      {manageAccountSection}
      <Section>
        <Row
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
        >
          <Icon>{logoutIcon}</Icon>
          Sign out
        </Row>
      </Section>
    </>
  );
  return (
    <div className={styles.dropDown} ref={ref} data-testid={'DropDown'}>
      <div
        className={classNames(styles.badge, user.loggedIn && styles.wallet)}
        onClick={() => {
          setIsOpen((b) => !b);
        }}
        data-testid={'DropDownBadge'}
      >
        <div
          className={styles.profilePicture}
          style={{
            margin: user.loggedIn ? 3 : undefined,
          }}
        >
          {profilePicturePlaceholder}
        </div>
        {user.loggedIn && (
          <>
            <div className={styles.walletDisplay}>{loggedInButtonDisplay}</div>
            <div className={styles.chevronDown}>{chevronDown}</div>
          </>
        )}
      </div>
      {isOpen && (
        <Content>{user.loggedIn ? loggedInContent : loggedOutContent}</Content>
      )}
    </div>
  );
};
