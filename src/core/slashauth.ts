import { errorInitializeFailed } from '../shared/errors/slashauth-errors';
import { LogoutOptions, SlashAuthClientOptions } from '../shared/global';
import {
  SlashAuthListenerPayload,
  SlashAuthLoginMethodConfig,
  SlashAuthModalStyle,
  SlashAuthOptions,
  SlashAuthStyle,
  SlashAuthWeb3ListenerPayload,
} from '../shared/types';
import { inBrowser } from '../shared/utils/browser';
import { ConnectOptions, SignInOptions } from '../types/slashauth';
import SlashAuthClient from './client';
import {
  LoginMethod,
  LoginMethodType,
  Web3LoginMethod,
} from './ui/context/login-methods';
import {
  ComponentControls,
  mountComponentManager,
  UnsubscribeFn,
} from './ui/manager';
import { Environment } from './ui/types/environment';
import { ModalType } from './ui/types/modal';
import { User } from './user';
import { Web3Manager, Web3ManagerEventType } from './web3/manager';

interface AppModalConfig {
  clientID?: string;
  name?: string;
  description?: string;
  modalStyle: SlashAuthModalStyle;
  loginMethods: SlashAuthLoginMethodConfig;
}

export type Listener = (payload: SlashAuthListenerPayload) => void;
export type UnsubscribeCallback = () => void;

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

  #user: User;

  #web3Manager: Web3Manager;

  #modalConfig: AppModalConfig | null = null;
  #isReady = false;

  #listeners: Listener[];

  constructor(web3Manager: Web3Manager, options: SlashAuthClientOptions) {
    this.#clientOptions = options;
    this.#client = new SlashAuthClient(options);
    this.#user = new User();
    this.#listeners = [];
    this.#web3Manager = web3Manager;
  }

  public get appName() {
    return this.#modalConfig?.name;
  }

  public get manager() {
    return this.#web3Manager;
  }

  public get client() {
    return this.#client;
  }

  public get user() {
    return this.#user;
  }

  public getWalletContext(): SlashAuthWeb3ListenerPayload {
    return {
      connected: this.#web3Manager.connected,
      provider: this.#web3Manager.provider,
      signer: this.#web3Manager.signer,
      address: this.#web3Manager.address,
    };
  }

  public addListener(listener: Listener): UnsubscribeCallback {
    this.#listeners.push(listener);
    // Emit immediately
    this.#emitSingle(listener);
    return () => {
      this.#listeners = this.#listeners.filter((l) => l !== listener);
    };
  }

  public isReady = () => this.#isReady;

  public async initialize() {
    if (this.#isReady || !inBrowser()) {
      return Promise.resolve();
    }
    this.#web3Manager.onEvent(this.#handleWeb3Event.bind(this));
    await Promise.all([
      this.fetchAppModalConfig(),
      this.checkLoginState(),
      this.#web3Manager.autoConnect(),
    ]);

    // TODO: Fetch this from the appmodalconfig.
    this.#environment = {
      authSettings: {
        availableWeb2LoginMethods: this.#getWeb2LoginMethods(),
        availableWeb3LoginMethods: this.#web3Manager.connectors
          .map((connector) => {
            if (this.#modalConfig.loginMethods.web3.eth) {
              switch (connector.id) {
                case 'metaMask':
                  if (
                    !this.#modalConfig.loginMethods.web3.eth.metamask.enabled
                  ) {
                    return null;
                  }
                  break;
                default:
                  if (
                    this.#modalConfig.loginMethods.web3.eth[connector.id] &&
                    !this.#modalConfig.loginMethods.web3.eth[connector.id]
                      .enabled
                  ) {
                    return null;
                  }
              }
            }
            return {
              id: connector.id,
              name: connector.name,
              type: 'web3',
              chain: 'eth',
              ready: connector.ready,
            };
          })
          .filter((connector) => connector !== null) as Web3LoginMethod[],
      },
    };

    if (SlashAuth.mountComponentManager) {
      this.#componentController = SlashAuth.mountComponentManager(
        this,
        this.#environment,
        {
          componentSettings: {
            signInModalStyle: this.#modalConfig.modalStyle,
          },
        }
      );
    }

    this.#isReady = true;

    this.#emitAll();
  }

  public connectWallet = async (
    options: ConnectOptions = {}
  ): Promise<string | null> => {
    await this.#web3Manager.autoConnect();
    if (options.transparent || this.#web3Manager.address) {
      return this.#web3Manager.address;
    }
    return new Promise((resolve, reject) => {
      let unsubscribe: UnsubscribeFn | null = null;
      try {
        this.openSignIn({
          walletConnectOnly: true,
        });
        unsubscribe = this.#componentController.addListener((payload) => {
          if (payload.action === 'close') {
            unsubscribe();
            if (this.#web3Manager.address) {
              resolve(this.#web3Manager.address);
            } else {
              resolve(null);
            }
          }
        });
      } catch (err) {
        if (unsubscribe) {
          unsubscribe();
        }
        reject(err);
      }
    });
  };

  public openSignInSync = (options: SignInOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      let unsubscribe: UnsubscribeFn | null = null;
      try {
        this.openSignIn(options);
        unsubscribe = this.#componentController.addListener((payload) => {
          if (payload.action === 'close') {
            unsubscribe();
            if (this.#web3Manager.address) {
              resolve();
            } else {
              resolve();
            }
          }
        });
      } catch (err) {
        if (unsubscribe) {
          unsubscribe();
        }
        reject(err);
      }
    });
  };

  public checkLoginState = async () => {
    const isLoggedIn = await this.#client.checkSession();
    if (isLoggedIn) {
      const account = await this.#client.getAccount();
      const tokenClaims = await this.#client.getIdTokenClaims();
      this.#user.setLoggedInState(tokenClaims, account, LoginMethodType.Web3);
      this.#emitAll();
    } else {
      this.#user.setLoggedOut();
    }
  };

  public logout = async (options?: LogoutOptions) => {
    this.#client.logout(options);
    this.#user.setLoggedOut();
    this.#emitAll();
  };

  public updateAppearanceOverride = (config?: SlashAuthStyle) => {
    this.assertComponentsReady(this.#componentController);
    this.#componentController.updateProps({ appearanceOverride: config });
  };

  public mountSignIn = (node: HTMLDivElement, options: SignInOptions = {}) => {
    this.assertComponentsReady(this.#componentController);
    this.#componentController.mountComponent({
      name: 'SignIn',
      appearanceKey: 'signIn',
      node,
      props: options,
    });
  };

  public unmountSignIn = (node: HTMLDivElement) => {
    this.assertComponentsReady(this.#componentController);
    this.#componentController.unmountComponent({
      node,
    });
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

  #emitAll = () => {
    this.#listeners.forEach((listener) => {
      this.#emitSingle(listener);
    });
  };

  #emitSingle = (listener: Listener) => {
    listener({
      core: {
        isReady: this.#isReady,
      },
      user: this.user,
      web3: this.getWalletContext(),
    });
  };

  #handleWeb3Event = async (event: Web3ManagerEventType) => {
    if (event === 'disconnect' || event === 'accountChange') {
      if (
        this.user.loggedIn &&
        this.user.loginMethod === LoginMethodType.Web3 &&
        (!this.manager.address ||
          this.user.account.email?.default?.toLowerCase() !==
            this.manager.address?.toLowerCase())
      ) {
        await this.logout();
        return;
      }
    }
    this.#emitAll();
  };

  #getWeb2LoginMethods = (): LoginMethod[] => {
    const resp: LoginMethod[] = [];
    if (this.#modalConfig.loginMethods.web2.enabled) {
      if (this.#modalConfig.loginMethods.web2.magicLink?.enabled) {
        resp.push({
          id: 'magic-link',
          type: LoginMethodType.MagicLink,
          name: 'Magic Link',
          ready: true,
        });
      }
    }
    return resp;
  };

  // #initializeWeb3Manager = async (options: ProviderOptions) => {
  //   const extractedOptions = {
  //     ...options,
  //   };

  //   if (!options.infura && options.walletconnect?.infuraId) {
  //     extractedOptions.infura = {
  //       apiKey: options.walletconnect.infuraId,
  //     };
  //   }

  //   if (!options.appName && options.coinbasewallet?.appName) {
  //     extractedOptions.appName = options.coinbasewallet.appName;
  //   }

  //   this.#web3Manager = new Web3Manager({
  //     appName: extractedOptions.appName,
  //     alchemy: extractedOptions?.alchemy,
  //     infura: extractedOptions?.infura,
  //     publicConf: extractedOptions?.publicConf,
  //   });
  // };
}
