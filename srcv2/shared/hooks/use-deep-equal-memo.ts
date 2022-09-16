import { dequal as deepEqual } from 'dequal';
import React from 'react';

type UseMemoFactory<T> = () => T;
type UseMemoDependencyArray = Exclude<
  Parameters<typeof React.useMemo>[1],
  'undefined'
>;
type UseDeepEqualMemo = <T>(
  factory: UseMemoFactory<T>,
  dependencyArray: UseMemoDependencyArray
) => T;

const useDeepEqualMemoize = <T>(value: T) => {
  const ref = React.useRef<T>(value);
  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [ref.current]);
};

export const useDeepEqualMemo: UseDeepEqualMemo = (
  factory,
  dependencyArray
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, useDeepEqualMemoize(dependencyArray));
};
