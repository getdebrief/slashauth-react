import React, { useEffect, useRef } from 'react';
import { useSlashAuth } from '@slashauth/slashauth-react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ComponentStory } from '@storybook/react';

export default {
  title: 'DropDown',
};
type TestUser = {
  name?: string;
  loggedIn: boolean;
  wallet?: { default: string };
  email?: string;
  social?: {
    google: string;
    twitter: string;
  };
};
const testUser: { [k: string]: TestUser } = {
  loggedOut: {
    loggedIn: false,
  },
  walletOnly: {
    loggedIn: true,
    wallet: {
      default: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    },
  },
  emailOnly: {
    loggedIn: true,
    email: 'Hailey@slashauth.com',
    wallet: undefined,
  },
  walletSocial: {
    loggedIn: true,
    wallet: {
      default: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    },
    social: { google: 'haileymiller298@gmail.com', twitter: '@0xhaileym' },
  },
  nameWalletSocial: {
    name: 'Hailey Miller',
    loggedIn: true,
    wallet: {
      default: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    },
    social: { google: 'haileymiller298@gmail.com', twitter: '@0xhaileym' },
  },
};
const testCompany = 'Acme corp';

export const Template: ComponentStory<any> = (args: { user: TestUser }) => {
  const context = useSlashAuth();
  const { mountDropDown } = context;
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      mountDropDown(ref.current, args.user as any);
    }
  }, [args.user, mountDropDown]);
  return <div ref={ref} />;
};
export const LoggedOut = Template.bind({});
const open = async function (canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await canvas.findByTestId('DropDown');
  const badge = canvas.getByTestId('DropDownBadge');
  await userEvent.click(badge);
  return { canvas, badge };
};
LoggedOut.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { canvas, badge } = await open(canvasElement);
  expect(canvas.getByText('Login to continue')).toBeInTheDocument();
  await userEvent.click(badge);
  expect(canvas.queryByText('Login to continue')).toBeNull();
};
export const WalletOnly = Template.bind({});
WalletOnly.args = {
  user: testUser.walletOnly,
};
WalletOnly.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { canvas, badge } = await open(canvasElement);
  const content = within(canvas.getByTestId('Content'));
  expect(content.queryByText('0x6c71…d4b4')).toBeTruthy();
  expect(content.queryByText('Manage account')).toBeTruthy();
  expect(content.queryByText('Sign out')).toBeTruthy();
};
export const EmailOnly = Template.bind({});
EmailOnly.args = {
  user: testUser.emailOnly,
};
export const WalletAndSocial = Template.bind({});
WalletAndSocial.args = {
  user: testUser.walletSocial,
};
export const NameWalletAndSocial = Template.bind({});
NameWalletAndSocial.args = {
  user: testUser.nameWalletSocial,
};
