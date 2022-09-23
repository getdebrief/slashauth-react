import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';
import { supportedFontFamilies } from './core/ui/fonts';
import { useNetwork } from './core/context/useNetwork';

SlashAuth.mountComponentManager = mountComponentManager;

export {
  SlashAuth,
  SlashAuthProvider,
  useSlashAuth,
  useNetwork,
  supportedFontFamilies,
};
