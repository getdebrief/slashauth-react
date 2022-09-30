import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Inner } from './inner';

export const DropDown = () => {
  const context = useCoreSlashAuth();
  return <Inner context={context} />;
};
