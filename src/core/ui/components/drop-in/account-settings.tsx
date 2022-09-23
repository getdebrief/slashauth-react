export const AccountSettings = () => {
  return (
    <div>
      <Header>Account Settings</Header>
      <SubHeader>
        Your account settings and connected social accounts can be ajdusted
        here.
      </SubHeader>
    </div>
  );
};
const Header = ({ children }) => (
  <div style={{ fontWeight: 600, fontSize: 28, lineHeight: '34px' }}>
    {children}
  </div>
);
const SubHeader = ({ children }) => <div>{children}</div>;
