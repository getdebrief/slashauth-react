import { ICache, InMemoryCache, LocalStorageCache } from './cache';
import { createRandomString } from './utils/string';

console.log(
  typeof window,
  'does equal undefined? ',
  typeof window === undefined
);
let cache: ICache;
if (typeof window !== 'undefined') {
  if (typeof window.localStorage !== 'undefined') {
    console.log('1');
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
  const browserDeviceID = createRandomString(24);
  cache.set<string>(DEVICE_ID, browserDeviceID);
}

export default browserDeviceID;
