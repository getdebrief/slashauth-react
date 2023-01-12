import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { Text, Size } from '../../primitives/text';
import { useLoginMethods, getIconsById } from '../../../context/login-methods';
import { useWeb3LoginState } from '../../../context/web3-signin';
import { Flex } from '../../primitives/container';
import { HighlightedIcon } from '../../primitives/icon';
import { BaseButton } from '../../primitives/button';
import { classNames } from '../../../../../shared/utils/classnames';
import text from '../../primitives/text.module.css';
import margin from '../../primitives/margin.module.css';
import styles from './action.module.css';
import { shortenEthAddress } from '../../../../../shared/utils/eth';

export const ActionScreen = ({ navigateBack, signNonceAndLogin }) => {
  const { selectedLoginMethod } = useLoginMethods();
  const { address } = useWeb3LoginState();

  return (
    <>
      {/* TODO: SLA-1969 - Update wording with new login flow designs */}
      <Header title="Confirm Connection" />
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
            {/* TODO: SLA-1969 - Update wording with new login flow designs */}
            You are connected with wallet address{' '}
            <strong>{shortenEthAddress(address)}</strong>
          </Text>
          <BaseButton
            className={margin.top4}
            primary
            wide
            onClick={signNonceAndLogin}
          >
            {/* TODO: SLA-1969 - Update wording with new login flow designs */}
            Continue
          </BaseButton>
        </Section>
        <Section className={styles.navigateBack}>
          <BaseButton onClick={navigateBack}>
            {/* TODO: SLA-1969 - Update wording with new login flow designs */}
            Or sign in with another wallet
          </BaseButton>
        </Section>
      </Content>
      <Footer />
    </>
  );
};
