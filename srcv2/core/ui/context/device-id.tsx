import React from 'react';
import { assertContextExists } from '../utils/context';

type DeviceContextValue = { value: { deviceID: string } };
export const DeviceContext = React.createContext<
  DeviceContextValue | undefined
>(undefined);
DeviceContext.displayName = 'DeviceContext';

export function useDeviceContext(): { deviceID: string } {
  const context = React.useContext(DeviceContext);
  assertContextExists(context, 'DeviceContext');
  return context.value;
}
