import { useMemo, useState, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Avatar, Size } from '../primitives/avatar';
import styles from './styles.module.css';
import { useSlashauthClientUserAccountSettings } from '../user_account_settings/useSlashauthClientUserAccountSettings';
import * as Header from '../sign-in/layout/header';
import { Content, Section } from '../sign-in/layout/content';
import { Footer } from '../sign-in/layout/footer';
import { Text, Align, Size as TextSize } from '../primitives/text';
import margin from '../primitives/margin.module.css';
import { classNames } from '../../../../shared/utils/classnames';
import { useIsAuthenticated } from '../../../hooks';
import { ArrowRightOnRectangleIcon } from '../icon/arrow_right_on_rectangle';
import { useSlashAuth } from '../../../context/legacy-slashauth';
import padding from '../primitives/padding.module.css';
import { UserCircleIcon } from '../icon/user_circle';
import avatarStyles from '../primitives/avatar.module.css';

import { Icon } from './icon';
import { EthLogo } from '../icon/ethereum-eth-logo';
import { EnvelopeIcon } from '../icon/envelope';
import summaryStyles from '../user_account_settings/screens/summary.module.css';
import { shortenEthAddress } from '../../../../shared/utils/eth';
import { Chip } from '../primitives/chip';
import { EtherscanLogo } from './icons/etherscan-logo';
import ReactTooltip from 'react-tooltip';
import { CheckMarkIcon } from '../icon/check_mark';
import { copyIcon } from './icons/copyIcon';
import { WalletIcon } from '../icon/wallet';
import { LoginMethodType } from '../../context/login-methods';

// TODO: SLA-1968 - Unify icons
const ConnectionTypeIcon = ({ type }) => {
  const style = {
    height: '20px',
    width: '20px',
    display: 'flex',
    marginRight: '8px',
  };

  switch (type) {
    case 'google':
      return (
        <img
          style={style}
          src="https://d1l2xccggl7xwv.cloudfront.net/icons/google.png"
          alt="Google logo"
        />
      );
    case 'magic_link':
      return (
        <EnvelopeIcon
          style={{ width: 18, height: 18, color: '#B6BCC8', ...style }}
        />
      );
    case 'managed_wallet':
    case 'eth_wallet_signature':
      return <Icon style={style}>{EthLogo}</Icon>;
    default:
      return null;
  }
};

// TODO: SLA-1968 - Unify icons
const BinIcon = ({ onClick }) => (
  <span className={summaryStyles.deleteAction} onClick={onClick}>
    <svg
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.833 4.83333L13.1102 14.9521C13.0479 15.8243 12.3222 16.5 11.4478 16.5H4.55154C3.67714 16.5 2.95141 15.8243 2.88911 14.9521L2.16634 4.83333M6.33301 8.16667V13.1667M9.66634 8.16667V13.1667M10.4997 4.83333V2.33333C10.4997 1.8731 10.1266 1.5 9.66634 1.5H6.33301C5.87277 1.5 5.49967 1.8731 5.49967 2.33333V4.83333M1.33301 4.83333H14.6663"
        stroke="#4B5563"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export const DropDown = () => {
  const isLoggedIn = useIsAuthenticated();
  const [copyManagedWalletSuccess, setCopyManagedWalletSuccess] =
    useState(false);
  const { accountSettings, removeConnection, addConnection } =
    useSlashauthClientUserAccountSettings();
  const { logout, openSignIn } = useSlashAuth();

  const { emails, web3Wallets, web2Accounts } = useMemo(() => {
    const connections = accountSettings?.connections || [];

    return {
      emails: connections.filter(
        (connection) => connection.displayType === 'email'
      ),
      web3Wallets: connections.filter(
        (connection) => connection.displayType === 'eth_wallet'
      ),
      web2Accounts: connections.filter(
        (connections) => connections.displayType === 'social'
      ),
    };
  }, [accountSettings?.connections]);

  const nonCustodialWallets = useMemo(
    () =>
      web3Wallets.filter(
        (connection) => connection.connectionType !== 'managed_wallet'
      ),
    [web3Wallets]
  );

  const addEmail = useCallback(() => {
    addConnection([LoginMethodType.FederatedGoogle, LoginMethodType.MagicLink]);
  }, [addConnection]);

  const addWallet = useCallback(() => {
    addConnection([LoginMethodType.Web3]);
  }, [addConnection]);

  if (!isLoggedIn) {
    return (
      <button
        className={styles.signInButton}
        aria-label="Sign In"
        onClick={() => openSignIn()}
      >
        <UserCircleIcon
          strokeWidth={1}
          className={classNames(
            avatarStyles.small,
            styles.alignMiddle,
            styles.colorFont
          )}
        />
        <Text
          className={classNames(
            styles.inline,
            padding.left2,
            padding.right4,
            styles.alignMiddle
          )}
        >
          Sign in
        </Text>
      </button>
    );
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={styles.avatarButton} aria-label="Update dimensions">
          {accountSettings ? (
            <Avatar
              size={Size.Small}
              src={accountSettings?.defaultProfileImage}
            />
          ) : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content collisionPadding={8} className={styles.contentWrapper}>
          <Header.Root>
            <Avatar
              size={Size.Medium}
              src={accountSettings?.defaultProfileImage}
            />
            <Header.Title>
              <Text size={TextSize.Large}>Alvaro Bernar</Text>
            </Header.Title>
          </Header.Root>
          <Content>
            {accountSettings ? (
              <Section>
                <Text
                  component="h2"
                  align={Align.Left}
                  className={margin.bottom2}
                >
                  Connected accounts:
                </Text>
                {nonCustodialWallets.length ? (
                  <div className={summaryStyles.actionOnHover}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ConnectionTypeIcon
                        type={nonCustodialWallets[0].connectionType}
                      />
                      <Text
                        align={Align.Left}
                        className={summaryStyles.settingsValue}
                      >
                        {shortenEthAddress(nonCustodialWallets[0].displayValue)}
                      </Text>
                      <div
                        data-tip="Check on Etherscan"
                        data-for="etherscan-tooltip"
                      >
                        <Icon
                          style={{
                            marginLeft: 8,
                            height: '18px',
                            width: '18px',
                          }}
                          onClick={() => {
                            window.open(
                              `https://etherscan.io/address/${nonCustodialWallets[0].displayValue}`,
                              '_blank'
                            );
                          }}
                        >
                          {EtherscanLogo}
                        </Icon>
                      </div>
                      <ReactTooltip
                        place="top"
                        type="dark"
                        effect="solid"
                        id="etherscan-tooltip"
                      />
                    </div>
                    <BinIcon
                      onClick={() =>
                        removeConnection(nonCustodialWallets[0].id)
                      }
                    />
                  </div>
                ) : (
                  <div className={summaryStyles.actionOnHover}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ConnectionTypeIcon
                        type={web3Wallets[0].connectionType}
                      />
                      <Text
                        align={Align.Left}
                        className={summaryStyles.settingsValue}
                        style={{ opacity: 0.6 }}
                      >
                        {shortenEthAddress(web3Wallets[0].displayValue)}
                      </Text>
                      <div
                        data-tip="Check on Etherscan"
                        data-for="etherscan-tooltip"
                      >
                        <Icon
                          style={{
                            marginLeft: 8,
                            height: '18px',
                            width: '18px',
                          }}
                          onClick={() => {
                            window.open(
                              `https://etherscan.io/address/${web3Wallets[0].displayValue}`,
                              '_blank'
                            );
                          }}
                        >
                          {EtherscanLogo}
                        </Icon>
                      </div>
                      <ReactTooltip
                        place="top"
                        type="dark"
                        effect="solid"
                        id="etherscan-tooltip"
                      />
                      <Icon
                        style={{
                          cursor: 'pointer',
                          height: '18px',
                          width: '18px',
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            web3Wallets[0].displayValue
                          );
                          setCopyManagedWalletSuccess(true);
                          setTimeout(
                            () => setCopyManagedWalletSuccess(false),
                            2000
                          );
                        }}
                      >
                        {copyManagedWalletSuccess ? CheckMarkIcon : copyIcon}
                      </Icon>
                    </div>
                  </div>
                )}
                {emails.length ? (
                  <div
                    className={summaryStyles.actionOnHover}
                    key={emails[0].id}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ConnectionTypeIcon type={emails[0].connectionType} />
                      <Text
                        align={Align.Left}
                        className={summaryStyles.settingsValue}
                      >
                        {emails[0].displayValue}
                      </Text>
                      <Chip>Verified</Chip>
                    </div>
                    <BinIcon onClick={() => removeConnection(emails[0].id)} />
                  </div>
                ) : null}
                {!nonCustodialWallets.length ? (
                  <div className={summaryStyles.action} onClick={addWallet}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <WalletIcon
                        style={{
                          height: '20px',
                          width: '20px',
                          display: 'flex',
                          marginRight: '8px',
                          color: '#B6BCC8',
                        }}
                      />
                      <Text
                        className={summaryStyles.addButton}
                        align={Align.Left}
                      >
                        Connect personal wallet
                      </Text>
                    </div>
                  </div>
                ) : null}
                {!emails.length ? (
                  <>
                    <div className={summaryStyles.action} onClick={addEmail}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ConnectionTypeIcon type="magic_link" />
                        <Text
                          className={summaryStyles.addButton}
                          align={Align.Left}
                        >
                          Connect email
                        </Text>
                      </div>
                    </div>
                    <div className={summaryStyles.action} onClick={addEmail}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ConnectionTypeIcon type="google" />
                        <Text
                          className={summaryStyles.addButton}
                          align={Align.Left}
                        >
                          Connect Google account
                        </Text>
                      </div>
                    </div>
                  </>
                ) : null}
              </Section>
            ) : null}
            <hr
              className={classNames(
                styles.horizontalDivider,
                margin.top6,
                margin.bottom0
              )}
            />
            <Section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ArrowRightOnRectangleIcon
                  style={{
                    height: '20px',
                    widtch: '20px',
                    verticalAlign: 'middle',
                    marginRight: '8px',
                    color: '#B6BCC8',
                  }}
                />
                <Text
                  component="a"
                  align={Align.Left}
                  className={styles.signOut}
                  onClick={() => logout()}
                  href="#"
                >
                  Sign Out
                </Text>
              </div>
            </Section>
            <hr
              className={classNames(
                styles.horizontalDivider,
                margin.top6,
                margin.bottom0
              )}
            />
          </Content>
          <Footer />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
