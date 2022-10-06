import { User } from '../../../user';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Inner } from './inner';
import { useUser } from '../../context/user';

export const DropDown = ({ testUser }: { testUser?: User }) => {
  const context = useCoreSlashAuth();
  const user = useUser();
  return <Inner user={testUser || user} context={context} />;
};
