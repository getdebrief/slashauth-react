import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';
import { supportedFontFamilies } from './core/ui/fonts';
import { Account } from './shared/global';
import { Buffer } from 'buffer';
import { UserAccountSettings } from './core/ui/components/user_account_settings';
import { DropDown } from './core/ui/components/drop-down/v1';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

SlashAuth.mountComponentManager = mountComponentManager;

export {
  useNetwork,
  useAccount,
  useHasRole,
  useHasOrgRole,
  useIsAuthenticated,
} from './core/hooks';

export * from './core/ui';

export {
  DropDown,
  UserAccountSettings,
  Account,
  SlashAuth,
  SlashAuthProvider,
  useSlashAuth,
  supportedFontFamilies,
};
