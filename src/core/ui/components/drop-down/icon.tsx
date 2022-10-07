export const Icon = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, ...props } = props_;
  return (
    <div
      style={{
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      {...props}
    />
  );
};
