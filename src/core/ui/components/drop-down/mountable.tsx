import { useEffect, useRef } from 'react';
import { useCoreSlashAuth } from '../../context/core-slashauth';

export const SlashAuthUserDropdownComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const slashAuth = useCoreSlashAuth();

  useEffect(() => {
    const mountedElemDiv = ref.current;
    slashAuth.mountDropDown(mountedElemDiv);

    return () => {
      slashAuth.unmountComponent(mountedElemDiv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} />;
};
