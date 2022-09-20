import React from 'react';
import { useAppearance } from '../context/appearance';
import { AppLogo } from './app-logo';
import { PoweredByTag } from './powered-by';

type CardProps = BaseCardProps &
  React.PropsWithChildren<Record<string, unknown>>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    return (
      <>
        <BaseCard
          style={{
            margin: '0, 1.5rem',
            width: '100%',
            maxWidth: 'calc(100vw - 20rem)',
            minWidth: '336px',
            minHeight: '446px',
            // TODO: Check on smaller screen sizes.
          }}
          ref={ref}
        >
          <div
            style={{
              width: '100%',
              flexGrow: '1',
            }}
          >
            <AppLogo />
            {props.children}
          </div>
          <div
            style={{
              width: '100%',
              flexShrink: '0',
            }}
          >
            <PoweredByTag />
          </div>
        </BaseCard>
      </>
    );
  }
);

type BaseCardProps = {
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ style, children }: BaseCardProps, ref) => {
    const appearance = useAppearance();
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          willChange: 'transform, opacity, height',
          borderRadius: appearance.modalStyle.borderRadius || '20px',
          backgroundColor: appearance.modalStyle.backgroundColor || 'white',
          transitionProperty:
            'background-color,border-color,color,fill,stroke,opacity,box-shadow,transform',
          transitionDuration: '200ms',
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.16)',
          border: '1px solid transparent',
          ...style,
        }}
        ref={ref}
        children={children}
      />
    );
  }
);
