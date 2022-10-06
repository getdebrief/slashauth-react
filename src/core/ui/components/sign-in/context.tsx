import React from 'react';
import { ParsedQs } from 'qs';
import { useRouter } from '../../router/context';
import { AvailableComponentCtx, SignInCtx } from '../../types/ui-components';

export type SignInContextType = SignInCtx & {
  queryParams: ParsedQs;
};

export const ComponentContext =
  React.createContext<AvailableComponentCtx | null>(null);

export const useSignInContext = (): SignInContextType => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) ||
    {}) as SignInCtx;
  const { queryParams } = useRouter();

  if (componentName !== 'SignIn') {
    throw new Error(
      '[SlashAuth]: useSignInContext called outside of the mounted SignIn component.'
    );
  }

  return {
    ...ctx,
    componentName,
    queryParams,
  };
};
