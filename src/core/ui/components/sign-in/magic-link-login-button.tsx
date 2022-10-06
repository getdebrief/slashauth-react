import { MailIcon } from '@heroicons/react/outline';
import { AbstractConnectorButton } from './abstract-login-button';

type Props = {
  display?: 'full' | 'icon';
  onClick: () => void;
};

export const MagicLinkConnectorButton = ({ display, onClick }: Props) => {
  const dim = display === 'icon' ? '24px' : '18px';
  return (
    <AbstractConnectorButton
      onClick={onClick}
      disabled={false}
      additionalStyles={{
        ...(display === 'icon' ? { justifyContent: 'center' } : {}),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '24px',
          height: '24px',
          justifyContent: 'center',
          ...(display !== 'icon' ? { marginRight: '1rem' } : {}),
        }}
      >
        <MailIcon style={{ width: dim, height: dim, color: '#B6BCC8' }} />
      </div>
      {display !== 'icon' && 'Sign in with a magic link'}
    </AbstractConnectorButton>
  );
};
