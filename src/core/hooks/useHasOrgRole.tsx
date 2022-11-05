import { useState, useCallback, useEffect, useRef } from 'react';
import { useCoreClient } from '../ui/context/slashauth-client';

type HasOrgRoleArgs = {
  organizationID: string;
  role: string;
};

type HookState = {
  organizationID: string | null;
  role: string | null;
  loading: boolean;
  hasOrgRole: boolean;
  error: Error | null;
};

export function useHasOrgRole({ organizationID, role }: HasOrgRoleArgs) {
  const slashAuthClient = useCoreClient();
  const fetching = useRef<boolean>(false);
  const [hookState, setHookState] = useState<HookState>({
    organizationID: null,
    role: null,
    loading: false,
    hasOrgRole: false,
    error: null,
  });

  const fetchHasOrgRole = useCallback(async () => {
    setHookState((prevState) => {
      if (!prevState.loading) {
        return { ...prevState, loading: true };
      }
      return prevState;
    });
    slashAuthClient
      .hasOrgRole(organizationID, role)
      .then((resp) => {
        setHookState({
          organizationID,
          role,
          loading: false,
          hasOrgRole: resp,
          error: null,
        });
      })
      .catch((err) => {
        setHookState({
          organizationID,
          role,
          loading: false,
          hasOrgRole: false,
          error: err,
        });
      });
  }, [organizationID, role, slashAuthClient]);

  useEffect(() => {
    if (
      fetching.current ||
      hookState.loading ||
      (hookState.role === role && hookState.organizationID === organizationID)
    ) {
      return;
    }
    fetching.current = true;
    try {
      setHookState({
        organizationID,
        role,
        loading: !!role && !!organizationID,
        hasOrgRole: false,
        error: null,
      });
      if (role && organizationID) {
        fetchHasOrgRole();
      }
    } finally {
      fetching.current = false;
    }
  }, [
    fetchHasOrgRole,
    hookState.loading,
    hookState.organizationID,
    hookState.role,
    organizationID,
    role,
    slashAuthClient,
  ]);

  return {
    ...hookState,
    refetch: fetchHasOrgRole,
  };
}
