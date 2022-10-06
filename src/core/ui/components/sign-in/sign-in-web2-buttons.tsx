import { useMemo } from 'react';
import { LoginMethod, useLoginMethods } from '../../context/login-methods';
import { Web2LoginButton } from './web2-login-button';

type Props = {
  onClick: (loginMethod: LoginMethod) => void;
};

export const SignInWeb2Buttons = ({ onClick }: Props) => {
  const enabledLoginMethods = useLoginMethods();

  const web2LoginMethods = useMemo(() => {
    return enabledLoginMethods.loginMethods.filter(
      (m) => m.type !== 'web3'
    ) as unknown as LoginMethod[];
  }, [enabledLoginMethods.loginMethods]);

  if (web2LoginMethods.length === 1) {
    // We need to return the long button here, and smaller buttons below.
    return (
      <Web2LoginButton
        loginMethod={web2LoginMethods[0]}
        onClick={onClick}
        display={'full'}
      />
    );
  } else if (web2LoginMethods.length === 2) {
    return (
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
        }}
      >
        {web2LoginMethods.map((meth) => {
          return (
            <Web2LoginButton
              loginMethod={meth}
              onClick={onClick}
              display={'icon'}
            />
          );
        })}
      </div>
    );
  }
};
