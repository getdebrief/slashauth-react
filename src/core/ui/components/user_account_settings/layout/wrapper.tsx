import React from 'react';
import styles from './wrapper.module.css';

export const Wrapper = <C extends React.ElementType = 'main'>({
  children,
  component,
}: {
  children: React.ReactNode;
  component?: C;
} & React.ComponentPropsWithoutRef<C>) => {
  const Element = component ?? 'main';

  return <Element className={styles.wrapper}>{children}</Element>;
};
