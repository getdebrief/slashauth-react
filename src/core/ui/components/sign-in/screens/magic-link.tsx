import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { BaseButton } from '../../primitives/button';
import margin from '../../primitives/margin.module.css';
import styles from './magic-link.module.css';
import { EmailInput } from '../../primitives/input';
import React from 'react';

export const MagicLinkScreen = ({ navigateBack, sendMagicLink }) => {
  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (event.target instanceof HTMLFormElement) {
      const formData = new FormData(event.target);

      sendMagicLink(Object.fromEntries(formData));
    }
  };

  return (
    <>
      <Header
        title="Enter your email"
        description="We will send you a link to login."
      />
      <Content>
        <form onSubmit={handleSubmit}>
          <Section>
            <EmailInput className={margin.top2} />
            <BaseButton
              component="input"
              type="submit"
              className={margin.top2}
              primary
              wide
              value="Send a MagicLink"
            />
          </Section>
          <Section className={styles.navigateBack}>
            <BaseButton onClick={navigateBack}>
              Or go back to login options
            </BaseButton>
          </Section>
        </form>
      </Content>
      <Footer />
    </>
  );
};
