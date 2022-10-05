import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';
import { supportedFontFamilies } from './core/ui/fonts';
import { TestProvider } from './core/ui/context/test';

SlashAuth.mountComponentManager = mountComponentManager;

export { useNetwork, useAccount } from './core/hooks';

export {
  SlashAuth,
  SlashAuthProvider,
  useSlashAuth,
  supportedFontFamilies,
  TestProvider,
};
