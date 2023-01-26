import { useEffect, useState } from 'react';
import { UserAccountSettings } from '../../../../shared/global';
import { useCoreSlashAuth } from '../../context/core-slashauth';

// Slashauth core to react
export const useFetchMyAccountSettings = () => {
  const { user, client } = useCoreSlashAuth();

  const [mySettings, setMySettings] = useState<
    UserAccountSettings | null | undefined
  >(undefined);

  useEffect(() => {
    client
      .getUserAccountSettings(user.userID)
      .then(setMySettings)
      .catch(() => setMySettings(null));
  }, [user, client]);

  return mySettings;
};
