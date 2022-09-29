export const Row = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, onClick, ...props } = props_;
  return (
    <div
      style={{
        display: 'flex',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
      {...props}
    />
  );
};
