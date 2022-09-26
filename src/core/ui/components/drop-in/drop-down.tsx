import { useUser } from '../../context/user';
import { useState } from 'react';

export const DropDown = () => {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <DropDownDiv>
      <div>
        {profilePicturePlaceholder}
        {user.account?.wallet.default}
      </div>
      {isOpen && (
        <Content>
          <Section>Manage account</Section>
          <Section>
            <Icon>{logoutIcon}</Icon>
            Sign out
          </Section>
        </Content>
      )}
    </DropDownDiv>
  );
};
const Icon = ({ children }) => (
  <div
    style={{
      marginRight: 12.5,
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {children}
  </div>
);
const DropDownDiv = ({ children }) => (
  <div
    style={{
      position: 'relative',
    }}
  >
    {children}
  </div>
);
const Content = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      right: 0,
      background: 'white',
      color: 'black',
      width: 246,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    }}
  >
    {children}
  </div>
);
const Section = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      lineHeight: '20px',
      display: 'flex',
    }}
  >
    {children}
  </div>
);
const profilePicturePlaceholder = (
  <svg
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="42" height="42" rx="21" fill="#B22D5B" />
    <path
      d="M29 29V28.25C29 25.9028 27.0972 24 24.75 24H17.25C14.9028 24 13 25.9028 13 28.25V29"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="21"
      cy="16"
      r="4"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const logoutIcon = (
  <svg
    width="18"
    height="16"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.1667 11.3335L16.5 8.00016M16.5 8.00016L13.1667 4.66683M16.5 8.00016L4.83333 8.00016M9.83334 11.3335V12.1668C9.83334 13.5475 8.71405 14.6668 7.33334 14.6668H4C2.61929 14.6668 1.5 13.5475 1.5 12.1668V3.8335C1.5 2.45278 2.61929 1.3335 4 1.3335H7.33334C8.71405 1.3335 9.83334 2.45278 9.83334 3.8335V4.66683"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
