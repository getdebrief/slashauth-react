import styles from './footer.module.css';
import pkg from '../../../../../../package.json';

const Copyright = () => (
  <a
    href={pkg.homepage}
    target="_blank"
    rel="noreferrer"
    className={styles.copyright}
  >
    Powered by <span className={styles.logo}>/auth</span>
  </a>
);

Copyright.displayName = 'Footer.Copyright';

export const Footer = ({ children }: { children?: React.ReactNode }) => (
  <footer className={styles.footer}>
    {children}
    <Copyright />
  </footer>
);
