import React from 'react';

import { Alert } from './alert';
import { Card } from './card';
import { useCardState } from '../context/card';
import { Flow } from './flow/flow';
import { Header } from './header';

type ErrorCardProps = {
  cardTitle?: string;
  cardSubtitle?: string;
  message?: string;
  onBackLinkClick?: React.MouseEventHandler | undefined;
};

export const ErrorCard = (props: ErrorCardProps) => {
  const { onBackLinkClick } = props;
  const card = useCardState();

  return (
    <Flow.Part part="error">
      <Card>
        <Alert>{card.error}</Alert>
        <Header.Root>
          {onBackLinkClick && <Header.BackLink onClick={onBackLinkClick} />}
          <Header.Title>Error</Header.Title>
          {props.cardSubtitle && (
            <Header.Subtitle>{props.cardSubtitle}</Header.Subtitle>
          )}
        </Header.Root>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {props.message && (
            <span
              style={{
                color: 'black',
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              {props.message}
            </span>
          )}
        </div>
      </Card>
    </Flow.Part>
  );
};
