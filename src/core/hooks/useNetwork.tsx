import { getNetwork, GetNetworkResult, watchNetwork } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { useCoreSlashAuth } from '../ui/context/core-slashauth';

export const useNetwork = (): GetNetworkResult => {
  const slashAuth = useCoreSlashAuth();
  const [network, setNetwork] = useState<GetNetworkResult>(null);

  useEffect(() => {
    setNetwork(getNetwork());
    const unsub = watchNetwork((data: GetNetworkResult) => {
      setNetwork(data);
    });
    return unsub;
  }, [slashAuth]);

  return network;
};
