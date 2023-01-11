import { LoginMethod, useLoginMethods } from '../../context/login-methods';
import { Web2LoginButton } from './web2-login-button';

type Props = {
  onClick: (loginMethod: LoginMethod) => void;
};

export const SignInWeb2Buttons = ({ onClick }: Props) => {
  const { web2 } = useLoginMethods();

  if (web2.length === 0) {
    return <div />;
  }

  if (web2.length === 1) {
    // We need to return the long button here, and smaller buttons below.
    return (
      <Web2LoginButton
        loginMethod={web2[0]}
        onClick={onClick}
        display={'full'}
      />
    );
  } else if (web2.length === 2) {
    return (
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
        }}
      >
        {web2.map((meth) => {
          return (
            <Web2LoginButton
              key={meth.id}
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
