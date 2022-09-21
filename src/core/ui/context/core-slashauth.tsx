import React from 'react';
import { SlashAuth } from '../../slashauth';
import { assertContextExists } from '../utils/context';

export type CoreSlashAuthProps = SlashAuth;

export const CoreSlashAuthContext = React.createContext<SlashAuth | undefined>(
  undefined
);
CoreSlashAuthContext.displayName = 'CoreSlashAuthContext';

export function useCoreSlashAuth(): CoreSlashAuthProps {
  const context = React.useContext(CoreSlashAuthContext);
  assertContextExists(context, 'CoreSlashAuthContext');
  return context;
}
