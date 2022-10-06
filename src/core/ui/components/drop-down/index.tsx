import { useCoreSlashAuth } from '../../context/core-slashauth';
import { Inner } from './inner';
import { SlashAuth } from '../../../slashauth';

export const DropDown = ({ testContext }: { testContext?: SlashAuth }) => {
  const context = useCoreSlashAuth();
  return <Inner context={testContext || context} />;
};
