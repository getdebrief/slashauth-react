import React, { useEffect, useRef } from 'react';
import { useSlashAuth, SlashAuth } from '@slashauth/slashauth-react';
import { userEvent, within } from '@storybook/testing-library';
import { expect, jest } from '@storybook/jest';
import { ComponentStory } from '@storybook/react';

export default {
  title: 'DropDown',
};
type User = InstanceType<typeof SlashAuth>['user'];
type TestUser = Pick<
  User,
  'loggedIn' | 'loginType' | 'loginIdentifier' | 'wallet'
>;
enum LoginMethodType {
  Web3 = 'web3',
  MagicLink = 'magic-link',
  FederatedGoogle = 'federated-google',
  FederatedDiscord = 'federated-discord',
  FederatedTwitter = 'federated-twitter',
  Unknown = 'unknown',
}
// type TestUser = {
//   name?: string;
//   loggedIn: boolean;
//   loginType: ;
//   loginIdentifier: string | undefined;
//   wallet?: string;
//   email?: string;
//   social?: {
//     google: string;
//     twitter: string;
//   };
// };
const testUser: { [k: string]: TestUser } = {
  loggedOut: {
    loggedIn: false,
    loginType: undefined,
    loginIdentifier: undefined,
    wallet: undefined,
  },
  walletOnly: {
    loggedIn: true,
    loginType: LoginMethodType.Web3,
    loginIdentifier: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    wallet: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
  },
  emailOnly: {
    loggedIn: true,
    loginType: LoginMethodType.MagicLink,
    loginIdentifier: 'Hailey@slashauth.com',
    wallet: undefined,
  },
  // walletSocial: {
  //   loggedIn: true,
  //   wallet: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
  //   loginIdentifier: 'Hailey@slashauth.com',
  //   social: { google: 'haileymiller298@gmail.com', twitter: '@0xhaileym' },
  // },
  // nameWalletSocial: {
  //   name: 'Hailey Miller',
  //   loggedIn: true,
  //   wallet: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
  //   social: { google: 'haileymiller298@gmail.com', twitter: '@0xhaileym' },
  // },
};
const testCompany = 'Acme corp';

const defaultContext: Partial<SlashAuth> = {
  isReady: () => true,
  logout: async () => {},
  openSignIn: async () => {},
  connectWallet: async () => null,
  appName: testCompany,
};
const Template: ComponentStory<any> = (args: Partial<SlashAuth>) => {
  const context = useSlashAuth();
  const { mountDropDown } = context;
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      mountDropDown(ref.current, {
        ...defaultContext,
        ...args,
      } as any);
    }
  }, []);
  return <div ref={ref} />;
};
export const LoggedOut = Template.bind({});
LoggedOut.args = {
  user: testUser.loggedOut,
};
const open = async function (canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const badge = await canvas.findByTestId('DropDownBadge');
  await userEvent.click(badge);
  const content = within(await canvas.findByTestId('Content'));
  return { canvas, badge, content };
};
LoggedOut.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { canvas, badge } = await open(canvasElement);
  expect(canvas.getByText('Login to continue')).toBeInTheDocument();
  await userEvent.click(badge);
  expect(canvas.queryByText('Login to continue')).toBeNull();
};
const openSignIn = jest.fn();
export const LogIn = Template.bind({});
LogIn.args = {
  user: testUser.loggedOut,
  openSignIn,
};
LogIn.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  openSignIn.mockClear();
  const { canvas } = await open(canvasElement);
  expect(openSignIn.mock.calls.length).toBe(0);
  await userEvent.click(canvas.getByText('Login to continue'));
  expect(openSignIn.mock.calls.length).toBe(1);
};
export const WalletOnly = Template.bind({});
WalletOnly.args = {
  user: testUser.walletOnly,
};
WalletOnly.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { content, badge } = await open(canvasElement);
  expect(within(badge).queryByText('0x6c71…d4b4')).toBeTruthy();
  expect(content.queryByText('0x6c71…d4b4')).toBeTruthy();
  expect(content.queryByText('Manage account')).toBeTruthy();
  expect(content.queryByText('Sign out')).toBeTruthy();
};
export const EmailOnly = Template.bind({});
EmailOnly.args = {
  user: testUser.emailOnly,
};
EmailOnly.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { content } = await open(canvasElement);
  expect(content.queryByText('Hailey@slashauth.com')).toBeTruthy();
};
const connectWallet = jest.fn();
export const ConnectWallet = Template.bind({});
ConnectWallet.args = {
  user: testUser.emailOnly,
  openSignIn: connectWallet,
};
ConnectWallet.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  connectWallet.mockClear();
  const { canvas } = await open(canvasElement);
  expect(connectWallet.mock.calls.length).toBe(0);
  await userEvent.click(canvas.getByText('Connect web3 wallet'));
  expect(connectWallet.mock.calls.length).toBe(1);
};
// export const WalletAndSocial = Template.bind({});
// WalletAndSocial.args = {
//   user: testUser.walletSocial,
// };
// export const NameWalletAndSocial = Template.bind({});
// NameWalletAndSocial.args = {
//   user: testUser.nameWalletSocial,
// };
const logout = jest.fn();
export const Logout = Template.bind({});
Logout.args = {
  user: testUser.emailOnly,
  logout,
};
Logout.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  logout.mockClear();
  const { canvas } = await open(canvasElement);
  expect(logout.mock.calls.length).toBe(0);
  await userEvent.click(canvas.getByText('Sign out'));
  expect(logout.mock.calls.length).toBe(1);
};
