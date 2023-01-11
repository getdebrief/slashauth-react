import styles from './footer.module.css';

const Copyright = () => (
  <small className={styles.copyright}>
    Powered by <span className={styles.logo}>/auth</span>
  </small>
);

Copyright.displayName = 'Footer.Copyright';

export const Footer = ({ children }: { children?: React.ReactNode }) => (
  <footer className={styles.footer}>
    {children}
    <Copyright />
  </footer>
);
