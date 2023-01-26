import { classNames } from '../../../../../shared/utils/classnames';
import styles from './summary.module.css';
import margin from '../../primitives/margin.module.css';
import { Text, Align } from '../../primitives/text';
import { Header } from '../layout/header';
import { useRouter } from '../../../router/context';
import { useMemo } from 'react';

export const SummaryScreen = ({ accountSettings }) => {
  const router = useRouter();

  if (accountSettings === null) {
    // display error
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

  return accountSettings ? (
    <>
      <Header
        title="Account Settings"
        description="Adjust your account settings and connected social accounts here."
      />
      <Text component="h2" align={Align.Left} className={margin.top8}>
        Profile Image
      </Text>
      <div className={classNames(styles.profileImage, margin.top2)}>
        <img
          src="https://avatars.githubusercontent.com/u/3150991?s=60&v=4"
          alt=""
        />
      </div>
      <Text component="h2" align={Align.Left} className={margin.top12}>
        Name
      </Text>
      <div>{accountSettings.name}</div>
      <Text
        component="a"
        className={classNames(styles.addButton, margin.top2)}
        align={Align.Left}
        onClick={() => router.navigate('./name')}
      >
        + Add name
      </Text>
      <Text component="h2" align={Align.Left} className={margin.top12}>
        Email address
      </Text>
      {emails.map((connection) => (
        <Text
          align={Align.Left}
          className={classNames(styles.settingsValue, margin.top2)}
        >
          {connection.connectionType} - {connection.displayValue}
        </Text>
      ))}
      <Text component="h2" align={Align.Left} className={margin.top12}>
        Web3 wallets
      </Text>
      {web3Wallets.map((connection) => (
        <Text
          align={Align.Left}
          className={classNames(styles.settingsValue, margin.top2)}
        >
          {connection.connectionType} - {connection.displayValue}
        </Text>
      ))}
      <Text component="h2" align={Align.Left} className={margin.top12}>
        Web2 accounts
      </Text>
      <Text
        className={classNames(styles.addButton, margin.top2)}
        align={Align.Left}
      >
        + Add social account
      </Text>
    </>
  ) : // loading screen
  null;
};
