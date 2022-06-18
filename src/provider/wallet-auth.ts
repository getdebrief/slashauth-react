import { useCallback } from 'react';
import { Connector, useConnect, useAccount, useClient } from 'wagmi';

export const useWalletAuth = () => {
  const client = useClient();

  const { connect, error, isConnecting, activeConnector, reset, connectors } =
    useConnect();

  const { data: account } = useAccount();

  const connectWallet = useCallback(
    (connector: Connector) => {
      connect(connector);
    },
    [connect]
  );

  const handleDeactivate = useCallback(() => {
    reset();
  }, [reset]);

  return {
    active: !!account,
    loading: isConnecting,
    account: account,
    error: error,
    connectors: connectors,
    client,
    provider: activeConnector?.getProvider(),
    connectWallet,
    deactivate: handleDeactivate,
  };
};
