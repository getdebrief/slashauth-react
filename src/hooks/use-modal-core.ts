import { Connector, Provider, Signer } from '@wagmi/core';
import { useCallback, useState } from 'react';
import {
  ACCOUNT_CHANGE_EVENT,
  ACCOUNT_CONNECTED_EVENT,
  CHAIN_CHANGE_EVENT,
  CONNECT_EVENT,
  DISCONNECT_EVENT,
  eventEmitter,
} from '../events';
import { GetAppConfigResponse } from '../global';
import { ModalCore } from '../modal/core';
import { ProviderOptions } from '../provider';
import { WagmiConnector } from '../provider/wagmi-connectors';

type InternalState = {
  provider: Provider | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: Signer | null;
  walletAddress: string | null;
  lastUpdate: number;
};

export const useModalCore = (options: ProviderOptions) => {
  const [connectModal, setConnectModal] = useState<ModalCore | null>(null);
  const [wagmiConnector, setWagmiConnector] = useState<WagmiConnector | null>(
    null
  );
  const [appConfig, setAppConfig] = useState<GetAppConfigResponse | null>(null);
  const [internalState, setInternalState] = useState<InternalState>({
    provider: null,
    signer: null,
    walletAddress: null,
    lastUpdate: 0,
  });

  const updateInternalState = useCallback(
    async (connector: Connector, updateTime: number) => {
      const account = await connector.getAccount();
      const signer = await connector.getSigner();
      const provider = await connector.getProvider();
      setInternalState((prev) => {
        if (prev.lastUpdate < updateTime) {
          if (account && !prev.walletAddress) {
            eventEmitter.emit(ACCOUNT_CONNECTED_EVENT, account);
          }
          return {
            walletAddress: account,
            signer,
            provider,
            lastUpdate: updateTime,
          };
        } else {
          return prev;
        }
      });
    },
    []
  );

  if (!wagmiConnector) {
    const extractedOptions = {
      ...options,
    };

    if (!options.infura && options.walletconnect?.infuraId) {
      extractedOptions.infura = {
        apiKey: options.walletconnect.infuraId,
      };
    }

    if (!options.appName && options.coinbasewallet?.appName) {
      extractedOptions.appName = options.coinbasewallet.appName;
    }

    const connector = new WagmiConnector({
      appName: extractedOptions.appName,
      alchemy: extractedOptions?.alchemy,
      infura: extractedOptions?.infura,
      publicConf: extractedOptions?.publicConf,
    });

    connector.onAccountChange((account: string | null) => {
      setInternalState((prev) => {
        if (prev.walletAddress !== account) {
          if (!prev.walletAddress && account) {
            eventEmitter.emit(ACCOUNT_CONNECTED_EVENT, account);
          }
          eventEmitter.emit(ACCOUNT_CHANGE_EVENT, account);
          return {
            ...prev,
            walletAddress: account,
            lastUpdate: Date.now(),
          };
        }
        return prev;
      });
      eventEmitter.emit(ACCOUNT_CHANGE_EVENT, {
        account,
      });
    });
    connector.onChainChange((chainId: number | string, unsupported: boolean) =>
      eventEmitter.emit(CHAIN_CHANGE_EVENT, {
        chainId,
        unsupported,
      })
    );
    connector.onDisconnect(() => {
      setInternalState({
        provider: null,
        signer: null,
        walletAddress: null,
        lastUpdate: Date.now(),
      });
      eventEmitter.emit(DISCONNECT_EVENT);
    });
    connector.onConnect((connector: Connector) => {
      updateInternalState(connector, Date.now());

      eventEmitter.emit(CONNECT_EVENT, {
        connector,
      });
    });

    setWagmiConnector(connector);
  }

  if (wagmiConnector && !connectModal) {
    const modalCore = new ModalCore(wagmiConnector);
    setConnectModal(modalCore);
  }

  if (connectModal && !connectModal.appConfig && appConfig) {
    connectModal.appConfig = appConfig;
  }

  const handleDeactivate = useCallback(() => {
    wagmiConnector?.disconnect();
  }, [wagmiConnector]);

  return {
    ...internalState,
    appConfig,
    connectModal,
    wagmiConnector,
    handleDeactivate,
    setAppConfig,
  };
};
