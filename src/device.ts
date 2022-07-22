import { ICache, InMemoryCache, LocalStorageCache } from './cache';
import { createRandomString } from './utils/string';

const getDeviceID = () => {
  let cache: ICache;
  if (typeof window !== 'undefined') {
    if (typeof window.localStorage !== 'undefined') {
      cache = new LocalStorageCache();
    }
  }
  if (!cache) {
    cache = new InMemoryCache().enclosedCache;
  }

  const DEVICE_ID = '_slashauth-browser-id';

  let browserDeviceID = createRandomString(24);
  let success = false;

  try {
    const existing = cache.get<string>(DEVICE_ID) as string;
    if (existing) {
      browserDeviceID = existing;
      success = true;
    }
    // eslint-disable-next-line no-empty
  } catch {}

  if (!success) {
    cache.set<string>(DEVICE_ID, browserDeviceID);
  }
  return browserDeviceID;
};

export default getDeviceID;
