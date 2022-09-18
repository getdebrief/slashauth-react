import { errorInitializeFailed } from '../shared/errors/slashauth-errors';
import {
  Account,
  LogoutOptions,
  SlashAuthClientOptions,
} from '../shared/global';
import { SlashAuthModalStyle, SlashAuthOptions } from '../shared/types';
import { SignInOptions } from '../types/slashauth';
import SlashAuthClient from './client';
import { ComponentControls, mountComponentManager } from './ui/manager';
import { ModalType } from './ui/types/modal';

interface AppModalConfig {
  clientID?: string;
  name?: string;
  description?: string;
  modalStyle: SlashAuthModalStyle;
}

interface LoggedInState {
  account: Account | null;
}

/**
 * This is the main class for the repo. This handles state management
 * and should be used for interacting with elements.
 */
export class SlashAuth {
  public static mountComponentManager?: typeof mountComponentManager;

  #componentController: ComponentControls;
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

    if (SlashAuth.mountComponentManager) {
      this.#componentController = SlashAuth.mountComponentManager(this, {
        style: this.#modalConfig,
      } as SlashAuthOptions);
    }

    this.#isReady = true;
    // TODO: When the user is logged in, we should check every 30 seconds if
    // they are still logged in.
  }

  public logout = async (options?: LogoutOptions) => {
    return this.#client.logout(options);
  };

  public openSignIn = (options: SignInOptions) => {
    this.assertComponentsReady(this.#componentController);
    this.#componentController?.openModal(ModalType.SignIn, options || {});
  };

  public closeSignIn = () => {
    this.assertComponentsReady(this.#componentController);
    this.#componentController?.closeModal(ModalType.SignIn);
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

  private assertComponentsReady(
    components: ComponentControls | null | undefined
  ): asserts components is ComponentControls {
    if (!SlashAuth.mountComponentManager) {
      throw new Error('SlashAuth was loaded without UI components.');
    }
    if (!components) {
      throw new Error('SlashAuth components are not ready yet.');
    }
  }
}
