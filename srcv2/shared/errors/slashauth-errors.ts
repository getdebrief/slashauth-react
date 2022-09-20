export const errorInitializeFailed = () => {
  throw new Error(
    '[SlashAuth] - Failed to initialize. Please contact us at support@slashauth.com'
  );
};

export const uiErrorDOMElementDoesNotExist = () => {
  throw new Error(
    '[SlashAuth] - The DOM element you provided does not exist. Please provide a DOM element.'
  );
};

export const contextDoesNotExist = (providerName: string) => {
  throw new Error(
    `[SlashAuth] - The context for ${providerName} does not exist.`
  );
};
