import React from 'react';

type Props = {
  children: React.ReactNode;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: React.CSSProperties;
};

export const Text = React.memo(({ children, size, style }: Props) => {
  const getTextSize = () => {
    switch (size) {
      case 'xs':
        return { fontSize: '10px', fontWeight: 400 };
      case 'sm':
        return { fontSize: '12px', fontWeight: 400 };
      case 'md':
        return { fontSize: '14px', fontWeight: 400 };
      case 'lg':
        return { fontSize: '16px', fontWeight: 400 };
      case 'xl':
        return { fontSize: '18px', fontWeight: 400 };
    }
  };

  return (
    <div
      style={{
        color: 'black',
        ...getTextSize(),
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
});
