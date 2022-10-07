import { useUser } from '../context/user';

export const AccountSettings = () => {
  const user = useUser();
  return (
    <div>
      <Header>Account Settings</Header>
      <SubHeader>
        Your account settings and connected social accounts can be ajdusted
        here.
      </SubHeader>
      <Label>Name</Label>
      <Value>Value</Value>
      <Label>Email</Label>
      <Value>Value</Value>
      <Label>Wallet</Label>
      <Value>
        {user.account?.wallet_type}
        {user.account?.wallet.default}
      </Value>
    </div>
  );
};
const Header = ({ children }) => (
  <div style={{ fontWeight: 600, fontSize: 28, lineHeight: '34px' }}>
    {children}
  </div>
);
const SubHeader = ({ children }) => (
  <div style={{ fontSize: 18, lineHeight: '22px' }}>{children}</div>
);
const Label = ({ children }) => (
  <div style={{ fontWeight: 600, fontSize: 18, lineHeight: '22px' }}>
    {children}
  </div>
);
const Value = ({ children }) => (
  <div style={{ fontSize: 16, lineHeight: '20px' }}>{children}</div>
);
