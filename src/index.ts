import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';
import { supportedFontFamilies } from './core/ui/fonts';
import { Account } from './shared/global';

SlashAuth.mountComponentManager = mountComponentManager;

export { useNetwork, useAccount } from './core/hooks';

export * from './core/ui';

export {
  Account,
  SlashAuth,
  SlashAuthProvider,
  useSlashAuth,
  supportedFontFamilies,
};
