import styles from './header.module.css';
import { useAppearance } from '../../../context/appearance';
import React from 'react';

const Wrapper = ({ children }) => (
  <header className={styles.wrapper}>{children}</header>
);

Wrapper.displayName = 'Header.Wrapper';

const Title = <C extends React.ElementType>({
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
}: {
  title: string;
  description?: string;
}) => {
  const appearance = useAppearance();
  const logoUrl = appearance.modalStyle.iconURL;

  return (
    <Wrapper>
      <Logo url={logoUrl} alt="Company logo" />
      {description ? (
        <h1 style={{ margin: 0 }}>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </h1>
      ) : (
        <Title component="h1">{title}</Title>
      )}
    </Wrapper>
  );
};
