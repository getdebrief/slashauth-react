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
import { useEffect, useRef } from 'react';
import { useRouter } from '../../../router/context';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const ActionScreen = ({ navigateBack, signNonceAndLogin }) => {
  const { selectedLoginMethod, setSelectedLoginMethodById } = useLoginMethods();
  const { address } = useWeb3LoginState();

  const prevAddress = usePrevious(address);
  const { navigate } = useRouter();

  useEffect(() => {
    /**
     * Address changed to undefined when the site is disconnected with Metamask.
     * In that case we go back to the login options to start the process all over again.
     * */
    if (prevAddress && !address) {
      navigate('../');
      setSelectedLoginMethodById(null);
    }
  }, [address, prevAddress, navigate, setSelectedLoginMethodById]);

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
            className={margin.top6}
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
