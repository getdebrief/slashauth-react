export const Flex = ({ gap, children, alignItems }) => (
  <span style={{ display: 'flex', gap, alignItems }}>{children}</span>
);
