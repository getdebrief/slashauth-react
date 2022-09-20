import { errorInitializeFailed } from '../shared/errors/slashauth-errors';
import {
  Account,
  LogoutOptions,
  SlashAuthClientOptions,
} from '../shared/global';
import { SlashAuthModalStyle, SlashAuthOptions } from '../shared/types';
import { ProviderOptions, SignInOptions } from '../types/slashauth';
import SlashAuthClient from './client';
import { ComponentControls, mountComponentManager } from './ui/manager';
import { Environment } from './ui/types/environment';
import { ModalType } from './ui/types/modal';
import { Web3Manager } from './web3/manager';

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
  #environment: Environment;
  #clientOptions: SlashAuthClientOptions;
  #client: SlashAuthClient;

  #web3Manager: Web3Manager;

  #modalConfig: AppModalConfig | null = null;
  #isReady = false;

  #loggedInState: LoggedInState = null;

  constructor(options: SlashAuthClientOptions) {
    this.#clientOptions = options;
    this.#client = new SlashAuthClient(options);
    this.#initializeWeb3Manager(options.providerOptions || {});
  }

  public get client() {
    return this.#client;
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

    // TODO: Fetch this from the appmodalconfig.
    this.#environment = {
      authSettings: {
        availableWeb3LoginMethods: this.#web3Manager.connectors.map(
          (connector) => ({
            id: connector.id,
            name: connector.name,
            type: 'web3',
            chain: 'eth',
            ready: connector.ready,
          })
        ),
        isMagicLinkEnabled: true,
      },
    };

    if (SlashAuth.mountComponentManager) {
      this.#componentController = SlashAuth.mountComponentManager(
        this,
        this.#environment,
        {
          style: this.#modalConfig,
        } as SlashAuthOptions
      );
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

  #initializeWeb3Manager = (options: ProviderOptions) => {
    const extractedOptions = {
      ...options,
    };

    if (!options.infura && options.walletconnect?.infuraId) {
      extractedOptions.infura = {
        apiKey: options.walletconnect.infuraId,
      };
    }

    if (!options.appName && options.coinbasewallet?.appName) {
      extractedOptions.appName = options.coinbasewallet.appName;
    }

    this.#web3Manager = new Web3Manager({
      appName: extractedOptions.appName,
      alchemy: extractedOptions?.alchemy,
      infura: extractedOptions?.infura,
      publicConf: extractedOptions?.publicConf,
    });

    // TODO: Hook up listeners
  };
}
