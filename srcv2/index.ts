import { SlashAuth } from './core/slashauth';
import { mountComponentManager } from './core/ui/manager';
import {
  SlashAuthProvider,
  useSlashAuth,
} from './core/context/legacy-slashauth';

SlashAuth.mountComponentManager = mountComponentManager;

export { SlashAuth, SlashAuthProvider, useSlashAuth };

export { default as ReactFromModule } from 'react';
