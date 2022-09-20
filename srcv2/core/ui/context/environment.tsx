import * as React from 'react';
import { Environment } from '../types/environment';
import { assertContextExists } from '../utils/context';

const EnvironmentContext = React.createContext<Environment | null>(null);

interface EnvironmentProviderProps {
  children: React.ReactNode;
  value: Environment;
}

function EnvironmentProvider({
  children,
  value,
}: EnvironmentProviderProps): JSX.Element {
  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

function useEnvironment(): Environment {
  const context = React.useContext(EnvironmentContext);
  assertContextExists(context, 'EnvironmentProvider');
  return context;
}

export { EnvironmentProvider, useEnvironment };
