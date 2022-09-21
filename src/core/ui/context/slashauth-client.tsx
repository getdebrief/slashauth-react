import React from 'react';
import SlashAuthClient from '../../client';
import { assertContextExists } from '../utils/context';

type CoreClientContextValue = { value: SlashAuthClient };
export const CoreClientContext = React.createContext<
  CoreClientContextValue | undefined
>(undefined);
CoreClientContext.displayName = 'CoreClientContext';

export function useCoreClient(): SlashAuthClient {
  const context = React.useContext(CoreClientContext);
  assertContextExists(context, 'CoreClientContext');
  return context.value;
}
