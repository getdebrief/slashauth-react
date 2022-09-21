export const CLASS_PREFIX = 's8-';

type ComponentMode = 'modal' | 'mounted';

export type RoutingStrategy = 'path' | 'hash' | 'virtual';

export type RedirectOptions = {
  /**
   * Full URL or path to navigate after successful sign in.
   */
  afterSignInUrl?: string | null;

  /**
   * Full URL or path to navigate after successful sign up.
   * Sets the afterSignUpUrl if the "Sign up" link is clicked.
   */
  afterSignUpUrl?: string | null;

  /**
   * Full URL or path to navigate after successful sign in,
   * or sign up.
   *
   * The same as setting afterSignInUrl and afterSignUpUrl
   * to the same value.
   */
  redirectUrl?: string | null;
};

export type SignInProps = {
  walletConnectOnly?: boolean;
  walletConnectTransparent?: boolean;
  /*
   * Root URL where the component is mounted on, eg: '/sign in'
   */
  path?: string;

  routing?: RoutingStrategy;
} & RedirectOptions;

export type AvailableComponentProps = SignInProps;

export type SignInCtx = SignInProps & {
  componentName: 'SignIn';
  mode?: ComponentMode;
};

export type AvailableComponentCtx = SignInCtx;
