import React, { useEffect } from 'react';
import getDeviceID from '../../../shared/device';
import {
  SlashAuthListenerPayload,
  SlashAuthWeb3ListenerPayload,
} from '../../../shared/types';
import SlashAuthClient from '../../client';
import { SlashAuth } from '../../slashauth';
import { User } from '../../user';
import { CoreSlashAuthContext } from './core-slashauth';
import { DeviceContext } from './device-id';
import { CoreClientContext } from './slashauth-client';
import { SlashAuthUserContext } from './user';
import { SlashAuthWalletContext } from './wallet';

type SlashAuthContextWrapperProps = {
  slashAuth: SlashAuth;
  children: React.ReactNode;
  testUser?: User;
};

type CoreSlashAuthContextProviderState = {
  client: SlashAuthClient;
  user: User;
  wallet: SlashAuthWeb3ListenerPayload;
};

export function SlashAuthUIProvider(
  props: SlashAuthContextWrapperProps
): JSX.Element | null {
  const slashAuth = props.slashAuth;

  const [state, setState] = React.useState<CoreSlashAuthContextProviderState>({
    client: slashAuth.client,
    user: slashAuth.user,
    wallet: slashAuth.getWalletContext(),
  });

  const { client } = state;
  const clientCtx = React.useMemo(() => ({ value: client }), [client]);

  const deviceID = getDeviceID();
  const deviceCtx = React.useMemo(() => ({ value: { deviceID } }), [deviceID]);

  const walletCtx = React.useMemo(() => ({ ...state.wallet }), [state.wallet]);

  useEffect(() => {
    const listener = (payload: SlashAuthListenerPayload) => {
      setState((s) => ({ ...s, wallet: payload.web3, user: payload.user }));
    };
    const unsubscribe = slashAuth.addListener(listener);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CoreSlashAuthContext.Provider value={slashAuth}>
      <CoreClientContext.Provider value={clientCtx}>
        <DeviceContext.Provider value={deviceCtx}>
          <SlashAuthWalletContext.Provider value={walletCtx}>
            <SlashAuthUserContext.Provider
              value={props.testUser || slashAuth.user}
            >
              {props.children}
            </SlashAuthUserContext.Provider>
          </SlashAuthWalletContext.Provider>
        </DeviceContext.Provider>
      </CoreClientContext.Provider>
    </CoreSlashAuthContext.Provider>
  );
}
