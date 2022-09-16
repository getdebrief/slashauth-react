import React from 'react';
import { createPortal } from 'react-dom';

type PortalProps = React.PropsWithChildren<Record<string, unknown>>;

export const Portal = (props: PortalProps) => {
  const elRef = React.useRef(document.createElement('div'));

  React.useEffect(() => {
    const mountedElem = elRef.current;
    document.body.appendChild(elRef.current);
    return () => {
      document.body.removeChild(mountedElem);
    };
  }, []);

  return createPortal(props.children, elRef.current);
};
