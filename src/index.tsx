import { useContext } from 'react';
import SlashAuthContext from './auth-context';

export { default as SlashAuthProvider } from './provider';
export {
  SlashAuthStepFetchingNonce,
  SlashAuthStepLoggedIn,
  SlashAuthStepLoggingIn,
  SlashAuthStepNonceReceived,
  SlashAuthStepNone,
} from './auth-context';

export const useSlashAuth = () => {
  const slashAuth = useContext(SlashAuthContext);

  return slashAuth;
};
