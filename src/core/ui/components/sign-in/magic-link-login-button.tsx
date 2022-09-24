import EmailIcon from '../../../../icon/email.svg';
import { AbstractConnectorButton } from './abstract-login-button';

type Props = {
  onClick: () => void;
};

export const MagicLinkConnectorButton = ({ onClick }: Props) => {
  return (
    <AbstractConnectorButton onClick={onClick} disabled={false}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '24px',
          height: '24px',
          justifyContent: 'center',
          marginRight: '1rem',
        }}
      >
        <img
          src={EmailIcon}
          alt="Email Logo"
          style={{ width: '18px', height: '14px', color: '#B6BCC8' }}
        />
      </div>
      Sign in with a magic link
    </AbstractConnectorButton>
  );
};
