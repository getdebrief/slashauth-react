import React from 'react';

type Props = React.HTMLProps<HTMLDivElement>;

export const Flex = React.memo(({ style, ...rest }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        ...style,
      }}
      {...rest}
    />
  );
});

export const FlexCol = React.memo((props: Props) => {
  return <Flex style={{ ...props.style, flexDirection: 'column' }} />;
});
