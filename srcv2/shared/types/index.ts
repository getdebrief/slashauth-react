import { Provider } from '@wagmi/core';
import { Signer } from 'ethers';
import { User } from '../../core/user';

export interface SlashAuthOptions {
  componentSettings?: SlashAuthStyle;
}

export interface SlashAuthModalStyle {
  backgroundColor?: string;
  borderRadius?: string;
  alignItems?: string;
  fontFamily?: string;
  fontColor?: string;
  buttonBackgroundColor?: string;
  hoverButtonBackgroundColor?: string;
  iconURL?: string;
}

export interface ComputedSlashAuthModalStyle {
  backgroundColor: string;
  borderRadius: string;
  alignItems: string;
  fontFamily: string;
  fontColor: string;
  buttonBackgroundColor: string;
  hoverButtonBackgroundColor: string;
  iconURL: string;
}

export interface SlashAuthStyle {
  signInModalStyle: SlashAuthModalStyle;
}

export interface SlashAuthWeb3ListenerPayload {
  connected: boolean;
  provider: Provider | undefined;
  signer: Signer | undefined;
  address: string | undefined;
}

export interface SlashAuthCoreListenerPayload {
  isReady: boolean;
}

export interface SlashAuthListenerPayload {
  core: SlashAuthCoreListenerPayload;
  user: User | null;
  web3: SlashAuthWeb3ListenerPayload;
}
