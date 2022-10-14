import { useCoreClient } from '../ui/context/slashauth-client';

type hasOrgRole = (
  organizationID: string,
  roleName: string
) => Promise<boolean>;

export function useHasOrgRole(): hasOrgRole {
  const slashAuthClient = useCoreClient();

  return slashAuthClient.hasOrgRole;
}
