import React from 'react';

import { useDeepEqualMemo } from '../../../shared/hooks';
import { SlashAuthModalStyle, SlashAuthStyle } from '../../../shared/types';
import { createContextAndHook } from '../../../shared/utils';

type AppearanceContextValue = {
  modalStyle: SlashAuthModalStyle;
};

const [AppearanceContext, useAppearance] =
  createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<SlashAuthStyle>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    return {
      value: {
        modalStyle: props.signInModalStyle,
      },
    };
  }, [props.signInModalStyle]);

  return (
    <AppearanceContext.Provider value={ctxValue}>
      {props.children}
    </AppearanceContext.Provider>
  );
};

export { AppearanceProvider, useAppearance };
