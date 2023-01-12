import React from 'react';

import { useDeepEqualMemo } from '../../../shared/hooks';
import {
  ComputedSlashAuthModalStyle,
  SlashAuthStyle,
  ThemeType,
} from '../../../shared/types';
import { createContextAndHook } from '../../../shared/utils';
import {
  DARK_SLASHAUTH_ICON,
  LIGHT_SLASHAUTH_ICON,
} from '../components/app-logo';

const DEFAULT_MODAL_STYLES: ComputedSlashAuthModalStyle = {
  type: ThemeType.Light,
  backgroundColor: '#ffffff',
  buttonBackgroundColor: '#ffffff',
  hoverButtonBackgroundColor: '#f5f5f5',
  borderRadius: '22px',
  fontFamily: 'sans-serif',
  fontColor: '#000000',
  alignItems: 'center',
  iconURL: DARK_SLASHAUTH_ICON,
  headerBackgroundColor: '#F3F4F6',
  headerFontColor: '#363849',
  lineColor: '#E5E7EB',
  primaryButtonBackgroundColor: '#424559',
  primaryButtonTextColor: 'white',
};

type AppearanceContextValue = {
  modalStyle: ComputedSlashAuthModalStyle;
};

const [AppearanceContext, useAppearance] =
  createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<SlashAuthStyle>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const theme = {
      ...DEFAULT_MODAL_STYLES,
      ...props.signInModalStyle,
    };

    if (theme.type === ThemeType.Dark) {
      theme.iconURL = LIGHT_SLASHAUTH_ICON;
    }

    const root = document.documentElement;
    Object.keys(theme).forEach((key) => {
      root.style.setProperty(`--slashauth-${key}`, theme[key]);
    });

    return {
      value: {
        modalStyle: theme,
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
