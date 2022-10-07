import styles from './styles.module.css';

export const Content = ({ children }) => (
  <div className={styles.content} data-testid={'Content'}>
    {children}
  </div>
);
