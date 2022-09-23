import { createContext, useContext, useEffect, useState } from 'react';
import { WagmiConfig } from 'wagmi';
import { ProviderOptions } from '../../types/slashauth';
import { Web3Manager } from '../web3/manager';
import { SlashAuthProviderOptions } from './legacy-slashauth';

type Props = {
  options: ProviderOptions;
  children: React.ReactNode;
};

const Web3ManagerContext = createContext<Web3Manager>(null);

export const SlashAuthWagmiProvider = ({ options, children }: Props) => {
  const [web3Manager, setWeb3Manager] = useState<Web3Manager>(null);

  useEffect(() => {
    const extractedOptions = {
      ...options,
    };

    if (!extractedOptions.infura && extractedOptions.walletconnect?.infuraId) {
      extractedOptions.infura = {
        apiKey: options.walletconnect.infuraId,
      };
    }

    if (!extractedOptions.appName && extractedOptions.coinbasewallet?.appName) {
      extractedOptions.appName = options.coinbasewallet.appName;
    }

    setWeb3Manager(
      new Web3Manager({
        appName: extractedOptions.appName,
        alchemy: extractedOptions?.alchemy,
        infura: extractedOptions?.infura,
        publicConf: extractedOptions?.publicConf,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!web3Manager) {
    return <div />;
  }

  return (
    <Web3ManagerContext.Provider value={web3Manager}>
      <WagmiConfig client={web3Manager.client}>{children}</WagmiConfig>
    </Web3ManagerContext.Provider>
  );
};

export const useWeb3Manager = (): Web3Manager => {
  const context = useContext(Web3ManagerContext);
  if (context === undefined) {
    throw new Error(
      'useWeb3Manager must be used within a SlashAuthWagmiProvider'
    );
  }
  return context;
};
