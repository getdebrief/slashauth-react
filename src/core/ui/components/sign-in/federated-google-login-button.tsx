import { AbstractConnectorButton } from './abstract-login-button';

type Props = {
  display?: 'full' | 'icon';
  onClick: () => void;
};

export const FederatedGoogleConnectorButton = ({ display, onClick }: Props) => {
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
        <img
          src="https://d1l2xccggl7xwv.cloudfront.net/icons/google.png"
          style={{ width: dim, height: dim }}
          alt="Google Logo"
        />
      </div>
      {display !== 'icon' && 'Sign in with Google'}
    </AbstractConnectorButton>
  );
};
