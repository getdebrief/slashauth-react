import React from 'react';

export const PoweredByTag = React.memo(() => {
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTop: '1px solid #e6e6e6',
        width: '100%',
        paddingBottom: '1rem',
        paddingTop: '1rem',
      }}
    >
      <span style={{ fontSize: '12px', color: '#9B9B9B' }}>
        Powered by /auth
      </span>
    </div>
  );
});
