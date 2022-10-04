import React from 'react';
import { chain, configureChains, createClient } from 'wagmi';
import { publicProvider } from '@wagmi/core/providers/public';
import { SlashAuthProvider } from '@slashauth/slashauth-react';

const { chains, provider } = configureChains(
  [chain.polygon],
  [publicProvider()],
  { pollingInterval: 30_000 }
);
const wagmiClient = createClient({
  autoConnect: true,
  provider: provider,
});
export const AppContext = (props: React.PropsWithChildren) => {
  return (
    <React.StrictMode>
      <SlashAuthProvider
        domain={'https://staging.slashauth.com'}
        clientID={'gGWTr1aOd7aUun_G'}
        providers={{
          wagmi: {
            wagmiClient,
            enabledChains: [chain.polygon],
          },
        }}
      >
        {props.children}
      </SlashAuthProvider>
    </React.StrictMode>
  );
};
