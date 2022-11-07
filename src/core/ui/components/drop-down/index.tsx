import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Inner } from './inner';
import { useUser } from '../../context/user';

export const DropDown = () => {
  const context = useCoreSlashAuth();
  const user = useUser();
  return (
    <Inner
      context={{
        ...context,
        user,
        appName: context.appName,
      }}
    />
  );
};
