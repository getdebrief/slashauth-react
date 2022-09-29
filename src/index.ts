import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';
import { supportedFontFamilies } from './core/ui/fonts';
import { DropDown } from './core/ui/components/drop-down';

SlashAuth.mountComponentManager = mountComponentManager;

export { useNetwork, useAccount } from './core/hooks';

export {
  SlashAuth,
  SlashAuthProvider,
  useSlashAuth,
  supportedFontFamilies,
  DropDown,
};
