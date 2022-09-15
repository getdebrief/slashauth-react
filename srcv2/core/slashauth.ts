import { errorInitializeFailed } from '../shared/errors/slashauth-errors';
import {
  Account,
  LogoutOptions,
  SlashAuthClientOptions,
} from '../shared/global';
import { SignInOptions } from '../types/slashauth';
import SlashAuthClient from './client';

interface AppModalConfig {
  clientID?: string;
  name?: string;
  description?: string;
  modalStyle: {
    backgroundColor?: string;
    borderRadius?: string;
    alignItems?: string;
    fontFamily?: string;
    fontColor?: string;
    buttonBackgroundColor?: string;
    hoverButtonBackgroundColor?: string;
    iconURL?: string;
  };
}

interface LoggedInState {
  account: Account | null;
}

/**
 * This is the main class for the repo. This handles state management
 * and should be used for interacting with elements.
 */
export class SlashAuth {
  #clientOptions: SlashAuthClientOptions;
  #client: SlashAuthClient;

  #modalConfig: AppModalConfig | null = null;
  #isReady = false;

  #loggedInState: LoggedInState = null;

  constructor(options: SlashAuthClientOptions) {
    this.#clientOptions = options;
    this.#client = new SlashAuthClient(options);
  }

  public isReady = () => this.#isReady;

  public async initialize() {
    if (this.#isReady) {
      return;
    }
    await Promise.all([
      this.fetchAppModalConfig(),
      this.#client.checkSession().then((isLoggedIn) => {
        if (isLoggedIn) {
          this.#client.getAccount().then((account) => {
            this.#loggedInState = { account };
          });
        }
      }),
    ]);

    this.#isReady = true;
    // TODO: When the user is logged in, we should check every 30 seconds if
    // they are still logged in.
  }

  public logout = async (options?: LogoutOptions) => {
    return this.#client.logout(options);
  };

  public openSignIn = (options: SignInOptions) => {
    // Open up the sign in flow.
  };

  public closeSignIn = () => {
    // Close the sign in close.
  };

  private fetchAppModalConfig = async () => {
    try {
      const data = await this.#client.getAppConfig();
      this.#modalConfig = data;
    } catch (error) {
      console.error('Error fetching app modal config', error);
      errorInitializeFailed();
    }
  };
}
