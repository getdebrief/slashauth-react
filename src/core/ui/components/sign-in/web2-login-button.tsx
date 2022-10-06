import { LoginMethod, LoginMethodType } from '../../context/login-methods';
import { MagicLinkConnectorButton } from './magic-link-login-button';

type Props = {
  display: 'full' | 'icon';
  loginMethod: LoginMethod;
  onClick: (loginMethod: LoginMethod) => void;
};

export const Web2LoginButton = ({ loginMethod, display, onClick }: Props) => {
  switch (loginMethod.type) {
    case LoginMethodType.MagicLink:
      return (
        <MagicLinkConnectorButton
          onClick={() => onClick(loginMethod)}
          display={display}
        />
      );
    default:
      return <div />;
  }
};
