export const Section = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, ...props } = props_;
  return (
    <div
      style={{
        fontSize: 12,
        lineHeight: '20px',
        borderTop: '1px solid #E7E9ED',
        padding: 15,
        ...style,
      }}
      {...props}
    />
  );
};
