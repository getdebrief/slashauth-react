import React from 'react';
import { assertContextExists } from '../utils/context';

type InteractionContextValue = {
  processing: boolean;
  setProcessing: (processing: boolean) => void;
};
export const InteractionContext = React.createContext<
  InteractionContextValue | undefined
>(undefined);
InteractionContext.displayName = 'InteractionContext';

export function useInteraction(): InteractionContextValue {
  const context = React.useContext(InteractionContext);
  assertContextExists(context, 'InteractionContext');
  return context;
}
