import React from 'react';
import { classNames } from '../../../../../shared/utils/classnames';
import styles from './content.module.css';

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={classNames(styles.section, className)}>
    {children}
  </section>
);

Section.displayName = 'Content.Section';

export const Content = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={classNames(styles.content, className)}>
      <div>{children}</div>
    </div>
  );
};
