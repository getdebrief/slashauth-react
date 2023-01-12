import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { useLoginMethods, getIconsById } from '../../../context/login-methods';
import { Flex } from '../../primitives/container';
import { HighlightedIcon } from '../../primitives/icon';
import styles from './success.module.css';

export const SuccessScreen = () => {
  const { selectedLoginMethod } = useLoginMethods();

  return (
    <>
      <Header title="You're logged in!" />
      <Content>
        <Section>
          <Flex alignItems="center" justifyContent="center">
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
        </Section>
      </Content>
      <Footer />
    </>
  );
};
