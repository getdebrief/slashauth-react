export const stub = (msg?: string): never => {
  throw new Error(
    msg || 'You forgot to wrap your component in <SlashAuthProvider>.'
  );
};

export const uninitializedStub = (): never => {
  throw new Error('You need to initialize this component first');
};
