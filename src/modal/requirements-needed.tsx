import { useMemo, useState } from 'react';
import { ADDITIONAL_INFO_SUBMIT_EVENT, eventEmitter } from '../events';

type Styles = {
  buttonBackgroundColor: string;
  hoverButtonBackgroundColor: string;
};

type Props = {
  requirements: string[];
  styles: Styles;
};

export const RequirementsNeededModalContents = ({
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
        <label htmlFor="email">Email</label>
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
        <label htmlFor="nickname">Nickname</label>
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

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '2rem 1rem',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <p style={{ fontSize: '16px', fontWeight: 500 }}>
        More info is required to login:
      </p>
      {emailDiv}
      {nicknameDiv}
      <button
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          border: `1px solid ${styles.buttonBackgroundColor}`,
          backgroundColor: isHover ? 'rgb(47, 95, 252)' : 'rgb(3, 59, 239)',
          color: 'white',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={
          (requirements.includes('email') && !emailValue) ||
          (requirements.includes('nickname') && !nicknameValue)
        }
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
  );
};
