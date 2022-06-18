import { useCallback } from 'react';
import {
  Connector,
  useConnect,
  useAccount,
  useClient,
  useDisconnect,
} from 'wagmi';

export const useWalletAuth = () => {
  const client = useClient();

  const { connect, error, isConnecting, activeConnector, reset, connectors } =
    useConnect();
  const { disconnect } = useDisconnect();

  const { data: account } = useAccount();

  const connectWallet = useCallback(
    (connector: Connector) => {
      connect(connector);
    },
    [connect]
  );

  const handleDeactivate = useCallback(() => {
    disconnect();
    reset();
  }, [reset, disconnect]);

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
