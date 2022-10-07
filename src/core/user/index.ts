import { Account, IdToken } from '../../shared/global';
import { LoginMethodType } from '../ui/context/login-methods';

export class User {
  #loggedIn: boolean;
  #idTokenClaims: IdToken | undefined;
  #account: Account | undefined;

  constructor() {
    this.#loggedIn = false;
    this.#idTokenClaims = undefined;
    this.#account = undefined;
  }

  static copyObject = (other: User) => {
    const user = new User();
    user.#loggedIn = other.#loggedIn;
    user.#idTokenClaims = other.#idTokenClaims;
    user.#account = other.#account;
    return user;
  };

  public get userID() {
    return this.#idTokenClaims?.sub;
  }

  public get wallet(): string | undefined {
    if (!this.#idTokenClaims?.wallet?.default) {
      return undefined;
    }
    if (this.#idTokenClaims?.wallet.default.indexOf(':') !== -1) {
      return this.#idTokenClaims?.wallet.default.split(':')[1];
    }
    return this.#idTokenClaims?.wallet.default;
  }

  public get rawWallet() {
    return this.#idTokenClaims?.wallet;
  }

  public get email() {
    return this.#idTokenClaims?.email?.default;
  }

  public get rawEmail() {
    return this.#idTokenClaims?.email;
  }

  public get loginType(): LoginMethodType | undefined {
    if (!this.loggedIn) {
      return undefined;
    }

    const loginMethods = this.loginMethods;
    // This shouldn't happen but let's not crap out.
    if (loginMethods.length === 0) {
      return undefined;
    }

    return loginMethods[0];
  }

  public get loginIdentifier(): string | undefined {
    switch (this.loginType) {
      case LoginMethodType.Web3:
        return this.wallet;
      case LoginMethodType.MagicLink:
        return this.email;
      case LoginMethodType.FederatedGoogle:
        return this.socials?.google?.email || this.email || this.wallet;
      case LoginMethodType.FederatedTwitter:
        return this.socials?.twitter?.handle || this.email || this.wallet;
      default:
        return this.wallet || this.email;
    }
  }

  public get socials() {
    return this.#idTokenClaims?.socials;
  }

  public get displayName() {
    return this.#idTokenClaims?.name;
  }

  public get loggedIn() {
    return this.#loggedIn;
  }

  public get idTokenClaims() {
    return this.#idTokenClaims;
  }

  public get account() {
    return this.#account;
  }

  public get loginMethods(): LoginMethodType[] {
    if (!this.#idTokenClaims?.amr) {
      return [];
    }
    return this.#idTokenClaims.amr.map((meth) => {
      switch (meth) {
        case 'WalletSignature':
          return LoginMethodType.Web3;
        case 'MagicLink':
          return LoginMethodType.MagicLink;
        case 'Federated.Google':
          return LoginMethodType.FederatedGoogle;
        case 'Federated.Twitter':
          return LoginMethodType.FederatedTwitter;
        case 'Federated.Discord':
          return LoginMethodType.FederatedDiscord;
        default:
          return LoginMethodType.Unknown;
      }
    });
  }

  public setLoggedInState = (tokenClaims: IdToken, account: Account) => {
    this.#loggedIn = true;
    this.#idTokenClaims = tokenClaims;
    this.#account = account;
  };

  public setLoggedOut = () => {
    this.#loggedIn = false;
    this.#idTokenClaims = undefined;
    this.#account = undefined;
  };
}
