import { useState } from 'react';
import SlashAuthClient from '../client';
import { SlashAuthProviderOptions } from '../provider';

export const useFetchNonce = () => {
  const [fetching, setFetching] = useState(false);

  const fetchNonce = async (
    account: string,
    client: SlashAuthClient,
    opts: SlashAuthProviderOptions
  ) => {
    if (fetching) {
      throw Error('already fetching');
    }
    setFetching(true);

    if (!account) {
      return;
    }
    const nonceResp = await client.getNonceToSign({
      ...opts,
      address: account,
    });
    return nonceResp;
  };

  return {
    fetching,
    fetchNonce,
  };
};
