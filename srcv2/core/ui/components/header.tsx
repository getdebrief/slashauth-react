import { ChevronLeftIcon } from '@heroicons/react/outline';
import React from 'react';
import { Flex, FlexCol } from './primitives/flex';
import { RouterLink } from './router-link';

type Props = {
  children: React.ReactNode;
};

const Root = React.memo(({ children }: Props): JSX.Element => {
  return <FlexCol>{children}</FlexCol>;
});

const Title = React.memo(({ children }: Props): JSX.Element => {
  return (
    <h1
      style={{
        fontSize: '1.5rem',
        color: 'black',
        fontWeight: 'bold',
      }}
    >
      {children}
    </h1>
  );
});

const Subtitle = React.memo(({ children }: Props): JSX.Element => {
  return (
    <h2
      style={{
        color: 'black',
        fontWeight: 400,
        fontSize: '1rem',
      }}
    >
      {children}
    </h2>
  );
});

const BackLink = (props: React.ComponentProps<typeof RouterLink>) => {
  return (
    <Flex style={{ marginBottom: '0.75rem' }}>
      <RouterLink {...props}>
        <ChevronLeftIcon />
        <div>Back</div>
      </RouterLink>
    </Flex>
  );
};

export const Header = {
  Root,
  Title,
  Subtitle,
  BackLink,
};
