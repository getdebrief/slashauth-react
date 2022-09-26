import { useUser } from '../../context/user';
import { useState } from 'react';

export const DropDown = () => {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      <div>
        <img src={''} />
        {user.account?.wallet.default}
      </div>
      {isOpen && <div></div>}
    </div>
  );
};
const Section = ({ children }) => (
  <div style={{ fontSize: 16, lineHeight: '20px' }}>{children}</div>
);
