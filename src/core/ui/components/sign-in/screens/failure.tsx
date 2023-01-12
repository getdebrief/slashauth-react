import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { Text, Size } from '../../primitives/text';
import { useLoginMethods, getIconsById } from '../../../context/login-methods';
import { Flex } from '../../primitives/container';
import { HighlightedIcon } from '../../primitives/icon';
import { BaseButton } from '../../primitives/button';
import { classNames } from '../../../../../shared/utils/classnames';
import text from '../../primitives/text.module.css';
import margin from '../../primitives/margin.module.css';
import styles from './failure.module.css';

export const FailureScreen = ({ retry }) => {
  const { selectedLoginMethod } = useLoginMethods();

  return (
    <>
      <Header title="Failed login attempt" />
      <Content>
        <Section>
          <Flex alignItems="center" justifyContent="center">
            {/* TODO: SLA-1968 - Create a shared sign in process status component */}
            <HighlightedIcon>
              <img src={getIconsById('slashAuth')} alt="SlashAuth logo" />
            </HighlightedIcon>
            <span className={styles.icon} />
            <HighlightedIcon>
              <img
                src={getIconsById(selectedLoginMethod?.id)}
                alt={`${selectedLoginMethod?.name} logo`}
              />
            </HighlightedIcon>
          </Flex>
          {/* TODO: SLA-1968 - Add centered property to text component */}
          <Text
            className={classNames(text.centered, margin.top4)}
            size={Size.Large}
          >
            {/* TODO: SLA-1968 - Create a shared error message component */}
            <strong className={styles.errorMessage}>Please try again</strong>
            <br />
            <br />
            There was an error while trying to login.
          </Text>
          <BaseButton className={margin.top4} primary wide onClick={retry}>
            Retry
          </BaseButton>
        </Section>
        {/* TODO: SLA-1968 - Create a shared vertical divider component */}
        <Section className={styles.verticalDivider}>
          <small className={styles.support}>
            If you continue to have issues, please contact us at{' '}
            {/* TODO: SLA-1968 - Create a shared link component */}
            <a href="mailto:support@slashauth.com">support@slashauth.com</a>
          </small>
        </Section>
      </Content>
      <Footer />
    </>
  );
};
