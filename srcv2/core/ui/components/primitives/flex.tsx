import React from 'react';

type Props = React.HTMLProps<HTMLDivElement>;

export const Flex = ({ style, ...rest }: Props) => {
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
};

export const FlexCol = ({ style, ...rest }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        ...style,
      }}
      {...rest}
    />
  );
};
