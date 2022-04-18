import { useContext } from 'react';
import SlashAuthContext from './auth-context';

import 'core-js/es/string/starts-with';
import 'core-js/es/symbol';
import 'core-js/es/array/from';
import 'core-js/es/typed-array/slice';
import 'core-js/es/array/includes';
import 'core-js/es/string/includes';
import 'core-js/es/set';
import 'promise-polyfill/src/polyfill';

import SlashAuthClient from './client';
import { SlashAuthClientOptions } from './global';

export * from './global';

/**
 * Asynchronously creates the Auth0Client instance and calls `checkSession`.
 *
 * **Note:** There are caveats to using this in a private browser tab, which may not silently authenticae
 * a user on page refresh.
 *
 * @param options The client options
 * @returns An instance of Auth0Client
 */
export default async function createSlashAuthClient(
  options: SlashAuthClientOptions
) {
  const slashAuth = new SlashAuthClient(options);
  await slashAuth.checkSession();
  return slashAuth;
}

export { SlashAuthClient };

export {
  GenericError,
  AuthenticationError,
  TimeoutError,
  PopupTimeoutError,
  PopupCancelledError,
  MfaRequiredError,
} from './errors';

export type { ICache, Cacheable } from './cache';
export { LocalStorageCache, InMemoryCache } from './cache';

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
