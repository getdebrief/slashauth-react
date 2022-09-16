import React from 'react';

// Note: this cannot be an error function as per: https://github.com/microsoft/TypeScript/issues/34523
function assertProviderExists(
  contextVal: unknown,
  msg: string
): asserts contextVal {
  if (!contextVal) {
    throw new Error(msg);
  }
}

type Options = {
  skipCheck?: boolean;
  assertCtxFn?: (v: unknown, msg: string) => void;
};

export function createContextAndHook<CtxValue>(
  displayName: string,
  options: Options = {}
): [React.Context<{ value: CtxValue } | undefined>, () => CtxValue] {
  const skipCheck = options.skipCheck || false;
  const Ctx = React.createContext<{ value: CtxValue } | undefined>(undefined);
  Ctx.displayName = displayName;
  const useCtx = (): CtxValue => {
    const ctx = React.useContext(Ctx);
    if (skipCheck) {
      return ctx ? ctx.value : (undefined as any);
    }
    if (!options.assertCtxFn) {
      assertProviderExists(ctx, `${displayName} not found`);
    } else {
      options.assertCtxFn(ctx, `${displayName} not found`);
    }
    return ctx.value;
  };
  return [Ctx, useCtx];
}
