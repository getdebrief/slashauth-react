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
      {isOpen && <Content>content</Content>}
    </DropDownDiv>
  );
};
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
  <div style={{ fontSize: 16, lineHeight: '20px' }}>{children}</div>
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
