import styles from './header.module.css';
import { useAppearance } from '../../../context/appearance';
import React from 'react';
import { useCoreSlashAuth } from '../../../context/core-slashauth';
import { plusIcon } from '../../drop-down/icons/plusIcon';

export const Root = ({ children }) => (
  <header className={styles.root}>{children}</header>
);

Root.displayName = 'Header.Root';

export const Title = <C extends React.ElementType>({
  component,
  children,
}: {
  component?: C;
  children: React.ReactNode;
}) => {
  const Element = component ?? 'span';

  return <Element className={styles.title}>{children}</Element>;
};

Title.displayName = 'Header.Title';

const Description = ({ children }) => (
  <span className={styles.description}>{children}</span>
);

Description.displayName = 'Header.Description';

const Logo = ({ url, alt }) => (
  <span className={styles.logo}>
    <img src={url} alt={alt} />
  </span>
);

Logo.displayName = 'Header.Logo';

export const Header = ({
  title,
  description,
  closable,
}: {
  title: string;
  description?: string;
  closable?: boolean;
}) => {
  const slashauth = useCoreSlashAuth();
  const appearance = useAppearance();
  const logoUrl = appearance.modalStyle.iconURL;

  return (
    <Root>
      {closable ? (
        <button
          onClick={() => slashauth.closeSignIn()}
          className={styles.closeButton}
        >
          {plusIcon}
        </button>
      ) : null}
      <Logo url={logoUrl} alt="Company logo" />
      {description ? (
        <h1 style={{ margin: 0 }}>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </h1>
      ) : (
        <Title component="h1">{title}</Title>
      )}
    </Root>
  );
};
