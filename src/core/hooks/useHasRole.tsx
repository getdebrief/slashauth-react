import { useCoreClient } from '../ui/context/slashauth-client';

type hasRole = (role: string) => Promise<boolean>;

export function useHasRole(): hasRole {
  const slashAuthClient = useCoreClient();

  return slashAuthClient.hasRole;
}
