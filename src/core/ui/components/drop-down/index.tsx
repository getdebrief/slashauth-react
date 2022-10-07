import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Inner } from './inner';
import { SlashAuth } from '../../../slashauth';
import { useUser } from '../../context/user';

export const DropDown = ({ testContext }: { testContext?: SlashAuth }) => {
  const context = useCoreSlashAuth();
  const user = useUser();
  return (
    <Inner
      context={
        testContext || {
          ...context,
          user,
          appName: context.appName,
        }
      }
    />
  );
};
