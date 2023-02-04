import { classNames } from '../../../../../shared/utils/classnames';
import styles from './summary.module.css';
import margin from '../../primitives/margin.module.css';
import { Text, Align } from '../../primitives/text';
import { Header } from '../layout/header';
import { useRouter } from '../../../router/context';
import { useMemo } from 'react';
import { Icon } from '../../drop-down/icon';
import { EthLogo } from '../../icon/ethereum-eth-logo';
import { Chip } from '../../primitives/chip';
import { Avatar } from '../../primitives/avatar';
import { MailIcon } from '@heroicons/react/outline';

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
        <MailIcon
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
  <span className={styles.deleteAction} onClick={onClick}>
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

export const SummaryScreen = ({
  accountSettings,
  removeConnection,
  editProfilePicture,
  addEmail,
  addWallet,
  addWeb2Account,
}) => {
  const router = useRouter();

  if (accountSettings === null) {
    // TODO: SLA-2139 - SR Implement error states for User Account Settings drop-in component
  }

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

  return accountSettings ? (
    <>
      <Header
        title="Account Settings"
        description="Adjust your account settings and connected social accounts here."
      />
      <Text component="h2" align={Align.Left} className={margin.top8}>
        Profile Image
      </Text>
      <Avatar
        className={margin.top2}
        src={accountSettings.defaultProfileImage}
        onChange={editProfilePicture}
      />
      <Text
        component="h2"
        align={Align.Left}
        className={classNames(margin.top12, margin.bottom2)}
      >
        Name
      </Text>
      <div className={styles.action} onClick={() => router.navigate('name')}>
        {accountSettings.name ? (
          <Text align={Align.Left} className={styles.settingsValue}>
            {accountSettings.name}
          </Text>
        ) : (
          <Text className={styles.addButton} align={Align.Left}>
            <span className={styles.addIcon}>+</span> Add name
          </Text>
        )}
        <span className={styles.navigateAction}>
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.6667 1.16667L16.5 7.00001M16.5 7.00001L10.6667 12.8333M16.5 7.00001L1.5 7"
              stroke="#2F5FFC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <Text
        component="h2"
        align={Align.Left}
        className={classNames(margin.top12, margin.bottom2)}
      >
        Email address
      </Text>
      {emails.length ? (
        emails.map((connection) => (
          <div className={styles.actionOnHover} key={connection.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ConnectionTypeIcon type={connection.connectionType} />
              <Text align={Align.Left} className={styles.settingsValue}>
                {connection.displayValue}
              </Text>
              <Chip>Verified</Chip>
            </div>
            <BinIcon onClick={() => removeConnection(connection.id)} />
          </div>
        ))
      ) : (
        <div className={styles.action} onClick={addEmail}>
          <Text className={styles.addButton} align={Align.Left}>
            <span className={styles.addIcon}>+</span> Add email
          </Text>
        </div>
      )}
      <Text
        component="h2"
        align={Align.Left}
        className={classNames(margin.top12, margin.bottom2)}
      >
        Web3 wallets
      </Text>
      {web3Wallets.length
        ? web3Wallets.map((connection) => (
            <div className={styles.actionOnHover} key={connection.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ConnectionTypeIcon type={connection.connectionType} />
                <Text align={Align.Left} className={styles.settingsValue}>
                  {connection.displayValue}
                </Text>
              </div>
              <BinIcon onClick={() => removeConnection(connection.id)} />
            </div>
          ))
        : null}
      {!nonCustodialWallets.length ? (
        <div className={styles.action} onClick={addWallet}>
          <Text className={styles.addButton} align={Align.Left}>
            <span className={styles.addIcon}>+</span> Add wallet
          </Text>
        </div>
      ) : null}
    </>
  ) : // loading screen
  null;
};
