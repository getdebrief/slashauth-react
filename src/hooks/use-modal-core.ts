import { Connector } from '@wagmi/core';
import { useCallback, useState } from 'react';
import {
  ACCOUNT_CHANGE_EVENT,
  CHAIN_CHANGE_EVENT,
  CONNECT_EVENT,
  DISCONNECT_EVENT,
  eventEmitter,
} from '../events';
import { GetAppConfigResponse } from '../global';
import { ModalCore } from '../modal/core';
import { ProviderOptions } from '../provider';
import { WagmiConnector } from '../provider/wagmi-connectors';

export const useModalCore = (options: ProviderOptions) => {
  const [connectModal, setConnectModal] = useState<ModalCore | null>(null);
  const [wagmiConnector, setWagmiConnector] = useState<WagmiConnector | null>(
    null
  );
  const [appConfig, setAppConfig] = useState<GetAppConfigResponse | null>(null);

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

    connector.onAccountChange((account: string | null) =>
      eventEmitter.emit(ACCOUNT_CHANGE_EVENT, {
        account,
      })
    );
    connector.onChainChange((chainId: number | string, unsupported: boolean) =>
      eventEmitter.emit(CHAIN_CHANGE_EVENT, {
        chainId,
        unsupported,
      })
    );
    connector.onDisconnect(() => eventEmitter.emit(DISCONNECT_EVENT));
    connector.onConnect((connector: Connector) => {
      eventEmitter.emit(CONNECT_EVENT, {
        connector,
      });
    });

    setWagmiConnector(connector);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  if (wagmiConnector && !connectModal) {
    const modalCore = new ModalCore(wagmiConnector);
    setConnectModal(modalCore);

    // TODO: Hide the modal when everything is connected!
  }

  if (connectModal && !connectModal.appConfig && appConfig) {
    connectModal.appConfig = appConfig;
  }

  const handleDeactivate = useCallback(() => {
    wagmiConnector?.clearState();

    // TODO: Disconnect listeners?
  }, [wagmiConnector]);

  return {
    appConfig,
    connectModal,
    wagmiConnector,
    handleDeactivate,
    setAppConfig,
  };
};
