import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { Text, Size } from '../../primitives/text';
import { useLoginMethods, getIconsById } from '../../../context/login-methods';
import { Flex } from '../../primitives/container';
import { HighlightedIcon } from '../../primitives/icon';
import { Loader } from '../../primitives/loader';
import { BaseButton } from '../../primitives/button';
import { classNames } from '../../../../../shared/utils/classnames';
import text from '../../primitives/text.module.css';
import margin from '../../primitives/margin.module.css';
import styles from './loading.module.css';

export const LoadingScreen = ({ navigateBack }) => {
  const { selectedLoginMethod } = useLoginMethods();

  return (
    <>
      <Header title="Confirm Connection" />
      <Content>
        <Section>
          <Flex gap={8} alignItems="center" justifyContent="center">
            {/* TODO: SLA-1968 - Create a shared sign in process status component */}
            <HighlightedIcon>
              <img src={getIconsById('slashAuth')} alt="SlashAuth logo" />
            </HighlightedIcon>
            <Loader color="black" size={8} />
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
            Connecting{' '}
            {selectedLoginMethod ? `to ${selectedLoginMethod?.name}` : ''}
          </Text>
          {/* TODO: SLA-1968 - Add centered property to text component */}
          <Text
            className={classNames(
              text.centered,
              margin.top2,
              styles.detailedDescription
            )}
          >
            Please sign the message in your wallet app or plugin to continue
          </Text>
        </Section>
        {/* TODO: SLA-1968 - Create a shared vertical divider component */}
        <Section className={styles.navigateBack}>
          <BaseButton onClick={navigateBack}>
            Or go back to login options
          </BaseButton>
        </Section>
      </Content>
      <Footer />
    </>
  );
};
