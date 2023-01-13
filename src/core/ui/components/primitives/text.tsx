import React from 'react';
import { classNames } from '../../../../shared/utils/classnames';
import styles from './text.module.css';

export enum Size {
  Medium,
  Large,
}

export const Text = <C extends React.ElementType = 'p'>({
  size = Size.Medium,
  component,
  children,
  className,
  ...props
}: {
  size?: Size;
  component?: C;
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<C>) => {
  const Element = component ?? 'p';

  return (
    <Element
      {...props}
      className={classNames(
        styles.text,
        size === Size.Large && styles.largeText,
        className
      )}
    >
      {children}
    </Element>
  );
};
