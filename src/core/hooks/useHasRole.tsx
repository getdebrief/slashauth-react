import { useCallback, useEffect, useRef, useState } from 'react';
import { useCoreClient } from '../ui/context/slashauth-client';

type HookState = {
  role: string | null;
  loading: boolean;
  hasRole: boolean;
  error: Error | null;
};

export function useHasRole(role: string) {
  const slashAuthClient = useCoreClient();
  const fetching = useRef<boolean>(false);
  const [hookState, setHookState] = useState<HookState>({
    role: null,
    loading: false,
    hasRole: false,
    error: null,
  });

  const fetchHasRole = useCallback(async () => {
    setHookState((prevState) => {
      if (!prevState.loading) {
        return { ...prevState, loading: true };
      }
      return prevState;
    });
    slashAuthClient
      .hasRole(role)
      .then((resp) => {
        setHookState({
          role,
          loading: false,
          hasRole: resp,
          error: null,
        });
      })
      .catch((err) => {
        setHookState({
          role,
          loading: false,
          hasRole: false,
          error: err,
        });
      });
  }, [role, slashAuthClient]);

  useEffect(() => {
    if (fetching.current || hookState.loading || hookState.role === role) {
      return;
    }
    fetching.current = true;
    try {
      setHookState({
        role,
        loading: !!role,
        hasRole: false,
        error: null,
      });
      if (role) {
        fetchHasRole();
      }
    } finally {
      fetching.current = false;
    }
  }, [fetchHasRole, hookState.loading, hookState.role, role, slashAuthClient]);

  return {
    ...hookState,
    refetch: fetchHasRole,
  };
}
