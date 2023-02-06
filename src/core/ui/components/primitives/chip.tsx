import styles from './chip.module.css';

export const Chip = ({ children }) => (
  <span className={styles.chip}>{children}</span>
);
