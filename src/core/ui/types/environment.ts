import { Web3LoginMethod } from '../context/login-methods';

export interface AuthSettings {
  availableWeb3LoginMethods: Web3LoginMethod[];
  isMagicLinkEnabled: boolean;
}

export interface Environment {
  authSettings: AuthSettings;
}
