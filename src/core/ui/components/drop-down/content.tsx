export const Content = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      right: 0,
      background: 'white',
      minWidth: 246,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
      borderRadius: '6px',
      marginTop: 10,
    }}
  >
    {children}
  </div>
);
