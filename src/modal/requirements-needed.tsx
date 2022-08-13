import { useMemo, useState } from 'react';
import { ADDITIONAL_INFO_SUBMIT_EVENT, eventEmitter } from '../events';

type Styles = {
  buttonBackgroundColor: string;
  hoverButtonBackgroundColor: string;
};

type Props = {
  appName: string | null;
  requirements: string[];
  styles: Styles;
};

export const RequirementsNeededModalContents = ({
  appName,
  requirements,
  styles,
}: Props) => {
  const [emailValue, setEmailValue] = useState('');
  const [nicknameValue, setNicknameValue] = useState('');
  const [isHover, setHover] = useState(false);

  const emailDiv = useMemo(() => {
    if (!requirements.includes('email')) {
      return null;
    }
    return (
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
        }}
      >
        <label htmlFor="email" style={{ fontSize: '12px', fontWeight: 700 }}>
          Email
        </label>
        <input
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #ccc',
            padding: '0.5rem',
          }}
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
        />
      </div>
    );
  }, [emailValue, requirements]);

  const nicknameDiv = useMemo(() => {
    if (!requirements.includes('nickname')) {
      return null;
    }
    return (
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
        }}
      >
        <label htmlFor="nickname" style={{ fontSize: '12px', fontWeight: 700 }}>
          Nickname
        </label>
        <input
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #ccc',
            padding: '0.5rem',
          }}
          value={nicknameValue}
          onChange={(e) => setNicknameValue(e.target.value)}
        />
      </div>
    );
  }, [nicknameValue, requirements]);

  const disabled = useMemo(
    () =>
      (requirements.includes('email') && !emailValue) ||
      (requirements.includes('nickname') && !nicknameValue),
    [requirements, emailValue, nicknameValue]
  );

  const buttonBackgroundColor = useMemo(() => {
    if (disabled) {
      return 'rgba(3, 59, 239, 0.6)';
    } else if (isHover) {
      return 'rgb(47, 95, 252)';
    } else {
      return 'rgb(3, 59, 239)';
    }
  }, [disabled, isHover]);

  return (
    <div
      className="slashauth-modal-scrollable"
      style={{
        overflowY: 'hidden',
        width: '100%',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          overflowY: 'auto',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: 400 }}>
          <span style={{ fontWeight: 700 }}>{appName || 'Unnamed app'}</span>{' '}
          requires the following information to log in
        </p>
        {emailDiv}
        {nicknameDiv}
        <button
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            border: `1px solid ${styles.buttonBackgroundColor}`,
            backgroundColor: buttonBackgroundColor,
            color: 'white',
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          disabled={disabled}
          onClick={() => {
            eventEmitter.emit(ADDITIONAL_INFO_SUBMIT_EVENT, {
              email: emailValue || undefined,
              nickname: nicknameValue || undefined,
            });
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
