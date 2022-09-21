import React from 'react';
import { User } from '../../user';
import { assertContextExists } from '../utils/context';

export type UserProps = User;

export const SlashAuthUserContext = React.createContext<User | undefined>(
  undefined
);
SlashAuthUserContext.displayName = 'SlashAuthUserContext';

export function useUser(): UserProps {
  const context = React.useContext(SlashAuthUserContext);
  assertContextExists(context, 'SlashAuthUserContext');
  return context;
}
