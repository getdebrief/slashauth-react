import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { UserAccountSettings } from '../../../../shared/global';
import { SlashAuthListenerPayload } from '../../../../shared/types';
import { useIsAuthenticated } from '../../../hooks';
import { useCoreSlashAuth } from '../../context/core-slashauth';

const assign = (a) => (b) => ({ ...b, ...a });

enum Status {
  Idle,
  InProgress,
  Cancelled,
  Completed,
  Stopped,
}

// TODO: Add comments here explaining
export const useSlashauthClientUserAccountSettings = () => {
  const slashauth = useCoreSlashAuth();
  const { user, client } = slashauth;
  const [accountSettings, setMySettings] = useState<
    UserAccountSettings | null | undefined
  >(undefined);

  const refreshData = useCallback(() => {
    client
      .getUserAccountSettings(user.userID)
      .then(setMySettings)
      .catch(() => setMySettings(null));
  }, [user, client]);

  useEffect(() => refreshData, [refreshData]);

  const patchAccountSettings = useCallback(
    async (updates: Partial<UserAccountSettings>) => {
      setMySettings(assign(updates));

      const data = await client.patchUserAccountSettings({
        id: user.userID,
        ...updates,
      });

      setMySettings(assign(data));
      // TODO: SLA-2139 - SR Implement error states for User Account Settings drop-in component
    },
    [user, client]
  );

  const removeConnection = useCallback(
    async (connectionID) => {
      await client.deleteConnection(user.userID, connectionID);

      refreshData();
      // TODO: SLA-2139 - SR Implement error states for User Account Settings drop-in component
    },
    [user, client, refreshData]
  );

  const editProfileImage = useCallback(
    async (file: File) => {
      const { id } = await client.uploadBlob(file, user.userID);

      const data = await client.patchUserAccountSettings({
        id: user.userID,
        defaultProfileImage: id,
      });

      setMySettings(assign(data));
    },
    [setMySettings, client, user]
  );

  const { status, startConnectionProcess } = useConnectionProcess();
  const isLoggedIn = useIsAuthenticated();

  useEffect(() => {
    if (status === Status.Completed) {
      refreshData();
      return;
    }

    if (isLoggedIn) {
      refreshData();
      return;
    }
  }, [status, refreshData, isLoggedIn]);

  return {
    accountSettings,
    patchAccountSettings,
    removeConnection,
    addConnection: startConnectionProcess,
    editProfileImage,
  };
};

const useConnectionProcess = () => {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const slashauth = useCoreSlashAuth();

  const session = useSessionListener();

  const startConnectionProcess = useCallback(
    async (loginMethods) => {
      setStatus(Status.InProgress);
      session.listen();

      try {
        await slashauth.openSignInSync({
          connectAccounts: true,
          includeLoginMethodTypes: loginMethods,
        });
      } catch (err) {
        // TODO: SLA-2139 - SR Implement error states for User Account Settings drop-in component
      } finally {
        setStatus(Status.Stopped);
      }
    },
    [slashauth, session]
  );

  useEffect(() => {
    if (status === Status.Stopped) {
      setStatus(session.hasChanged ? Status.Completed : Status.Cancelled);
    }
  }, [status, session]);

  return { status, startConnectionProcess };
};

const useSessionListener = () => {
  const slashauth = useCoreSlashAuth();
  const [sessionID, setSessionID] = useState(slashauth.user.idTokenClaims?.jti);
  const prevSessionID = useRef(slashauth.user.idTokenClaims?.jti);

  const listen = useCallback(() => {
    prevSessionID.current = sessionID;
  }, [sessionID]);

  useEffect(() => {
    const unsubscribe = slashauth.addListener(
      (payload: SlashAuthListenerPayload) => {
        setSessionID(payload.user.idTokenClaims?.jti);
      }
    );

    return unsubscribe;
  }, [slashauth, slashauth.addListener]);

  const hasChanged = useMemo(() => {
    return sessionID !== prevSessionID.current;
  }, [sessionID]);

  return { listen, hasChanged };
};
