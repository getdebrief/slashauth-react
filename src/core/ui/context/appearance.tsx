import React from 'react';

import { useDeepEqualMemo } from '../../../shared/hooks';
import {
  ComputedSlashAuthModalStyle,
  SlashAuthStyle,
} from '../../../shared/types';
import { createContextAndHook } from '../../../shared/utils';
import { DARK_SLASHAUTH_ICON } from '../components/app-logo';

const DEFAULT_MODAL_STYLES: ComputedSlashAuthModalStyle = {
  backgroundColor: '#ffffff',
  buttonBackgroundColor: '#ffffff',
  hoverButtonBackgroundColor: '#f5f5f5',
  borderRadius: '8px',
  fontFamily: 'sans-serif',
  fontColor: '#000000',
  alignItems: 'center',
  iconURL: DARK_SLASHAUTH_ICON,
};

type AppearanceContextValue = {
  modalStyle: ComputedSlashAuthModalStyle;
};

const [AppearanceContext, useAppearance] =
  createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<SlashAuthStyle>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  console.log('appearance provider props: ', props);
  const ctxValue = useDeepEqualMemo(() => {
    return {
      value: {
        modalStyle: {
          ...DEFAULT_MODAL_STYLES,
          ...props.signInModalStyle,
        },
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
