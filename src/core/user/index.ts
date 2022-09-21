import { Account, IdToken } from '../../shared/global';
import { LoginMethodType } from '../ui/context/login-methods';

export class User {
  #loggedIn: boolean;
  #idTokenClaims: IdToken | undefined;
  #account: Account | undefined;
  #loginMethod: LoginMethodType | undefined;

  constructor() {
    this.#loggedIn = false;
    this.#idTokenClaims = undefined;
    this.#loginMethod = undefined;
    this.#account = undefined;
  }

  public get userID() {
    return this.#idTokenClaims?.sub;
  }

  public get wallet() {
    return this.#idTokenClaims?.wallet;
  }

  public get loggedIn() {
    return this.#loggedIn;
  }

  public get idTokenClaims() {
    return this.#idTokenClaims;
  }

  public get loginMethod() {
    return this.#loginMethod;
  }

  public get account() {
    return this.#account;
  }

  public setLoggedInState = (
    tokenClaims: IdToken,
    account: Account,
    loginMethod: LoginMethodType
  ) => {
    this.#loggedIn = true;
    this.#idTokenClaims = tokenClaims;
    this.#account = account;
    this.#loginMethod = loginMethod;
  };

  public setLoggedOut = () => {
    this.#loggedIn = false;
    this.#idTokenClaims = undefined;
    this.#account = undefined;
    this.#loginMethod = undefined;
  };
}
