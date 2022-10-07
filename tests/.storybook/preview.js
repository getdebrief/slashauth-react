import React from 'react';
import { AppContext } from '../src/app-context';

export const decorators = [
  (Story) => (
    <AppContext>
      <Story />
    </AppContext>
  ),
];
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
