export const inBrowser = (): boolean => {
  return typeof window !== 'undefined';
};
