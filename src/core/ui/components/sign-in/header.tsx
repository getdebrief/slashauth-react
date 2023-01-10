import styles from './header.module.css';
import { useAppearance } from '../../context/appearance';
import React from 'react';

const Wrapper = ({ children }) => (
  <header className={styles.wrapper}>{children}</header>
);

const Title = <C extends React.ElementType>({
  as,
  children,
}: {
  as?: C;
  children: React.ReactNode;
}) => {
  const Element = as ?? 'span';

  return <Element className={styles.title}>{children}</Element>;
};

const Description = ({ children }) => (
  <span className={styles.description}>{children}</span>
);

const Logo = ({ url, alt }) => (
  <span className={styles.logo}>
    <img src={url} alt={alt} />
  </span>
);

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
        <Title as="h1">{title}</Title>
      )}
    </Wrapper>
  );
};
