export const Flex = ({
  gap,
  children,
  alignItems,
  justifyContent,
}: {
  gap?: number;
  children: React.ReactNode;
  alignItems?: string;
  justifyContent?: string;
}) => (
  <span style={{ display: 'flex', gap, alignItems, justifyContent }}>
    {children}
  </span>
);
