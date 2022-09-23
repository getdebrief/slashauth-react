import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';
import { supportedFontFamilies } from './core/ui/fonts';
import { AccountSettings } from './core/ui/components/drop-in/account-settings';

SlashAuth.mountComponentManager = mountComponentManager;

export { useAccount, useNetwork } from './core/hooks';

export {
  SlashAuth,
  SlashAuthProvider,
  useSlashAuth,
  supportedFontFamilies,
  AccountSettings,
};
