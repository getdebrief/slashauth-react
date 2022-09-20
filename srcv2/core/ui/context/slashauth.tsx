import React from 'react';
import SlashAuthClient from '../../client';
import { SlashAuth } from '../../slashauth';
import { CoreSlashAuthContext } from './core-slashauth';
import { CoreClientContext } from './slashauth-client';

type SlashAuthContextWrapperProps = {
  slashAuth: SlashAuth;
  children: React.ReactNode;
};

type CoreSlashAuthContextProviderState = {
  client: SlashAuthClient;
};

export function SlashAuthUIProvider(
  props: SlashAuthContextWrapperProps
): JSX.Element | null {
  const slashAuth = props.slashAuth;

  const [state, setState] = React.useState<CoreSlashAuthContextProviderState>({
    client: slashAuth.client,
  });

  const { client } = state;
  const clientCtx = React.useMemo(() => ({ value: client }), [client]);

  return (
    <CoreSlashAuthContext.Provider value={slashAuth}>
      <CoreClientContext.Provider value={clientCtx}>
        {props.children}
      </CoreClientContext.Provider>
    </CoreSlashAuthContext.Provider>
  );
}
