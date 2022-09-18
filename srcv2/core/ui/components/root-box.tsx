import React from 'react';

type RootBoxProps = React.PropsWithChildren<{ className: string }>;

export const RootBox = React.memo((props: RootBoxProps) => {
  const [showSpan, setShowSpan] = React.useState(true);
  const parentRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }
    if (showSpan) {
      setShowSpan(false);
    }
    parent.className = props.className;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.className]);

  return (
    <>
      {props.children}
      {showSpan && (
        <span
          ref={(el) =>
            (parentRef.current = el ? el.parentElement : parentRef.current)
          }
          aria-hidden
          style={{ display: 'none' }}
        />
      )}
    </>
  );
});
