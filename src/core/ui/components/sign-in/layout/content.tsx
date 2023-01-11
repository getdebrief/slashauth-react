import React from 'react';
import styles from './content.module.css';

export const Section = ({ children }) => (
  <section className={styles.section}>{children}</section>
);

Section.displayName = 'Content.Section';

export const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.content}>
      <div>{children}</div>
    </div>
  );
};
