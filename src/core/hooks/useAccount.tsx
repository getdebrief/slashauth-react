import { dequal as deepEqual } from 'dequal';
import { Provider } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { Account } from '../../shared/global';
import {
  SlashAuthListenerPayload,
  SlashAuthWeb3ListenerPayload,
} from '../../shared/types';
import { useCoreSlashAuth } from '../ui/context/core-slashauth';

export type AccountStatus = {
  wallet?: Omit<Omit<SlashAuthWeb3ListenerPayload, 'signer'>, 'provider'>;
  account?: Account;
  provider?: Provider;
};

export type UseAccountConfig = {
  onConnect?({ wallet, provider }: AccountStatus): void;
  onDisconnect?(): void;
};

export function useAccount({
  onConnect,
  onDisconnect,
}: UseAccountConfig = {}): AccountStatus {
  const [accountStatus, setAccountStatus] =
    useState<Omit<AccountStatus, 'provider'>>(null);
  const slashAuth = useCoreSlashAuth();

  useEffect(() => {
    const unsub = slashAuth.addListener((payload: SlashAuthListenerPayload) => {
      setAccountStatus((prev) => {
        const updated = {
          account: payload.user.account,
          wallet: {
            address: payload.web3.address,
            connected: payload.web3.connected,
          },
        };
        if (!deepEqual(updated, prev)) {
          if (prev === null) {
            onConnect?.({
              ...updated,
              provider: slashAuth.manager.provider,
            });
          } else if (!payload.user.account) {
            onDisconnect?.();
          }
          return updated;
        }
        return prev;
      });
    });

    return unsub;
  }, [onConnect, onDisconnect, slashAuth]);

  return {
    ...accountStatus,
    provider: slashAuth.manager.provider,
  };
}
