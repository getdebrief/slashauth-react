import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { BaseButton, ButtonWithIcon } from '../../primitives/button';
import { Text } from '../../primitives/text';
import styles from './sign-in.module.css';
import {
  useLoginMethods,
  getIconsById,
  LoginMethod,
} from '../../../context/login-methods';
import { useMemo, useState } from 'react';

export const SignInScreen = ({ startLoginWith }) => {
  const { web3, web2 } = useLoginMethods();

  const web3LoginMethodsOrdered = useMemo(() => {
    const disabledLast = (a: LoginMethod, b: LoginMethod) => {
      if (a.ready && !b.ready) return -1;
      if (!a.ready && b.ready) return 1;
      return 0;
    };

    return web3.sort(disabledLast);
  }, [web3]);

  const maxDisplayedOptions = web2.length === 0 ? 4 : 2;
  const isShowMoreEnabled = web3.length > maxDisplayedOptions;
  const [showMore, setShowMore] = useState(false);

  const visibleMethods = useMemo(() => {
    if (!isShowMoreEnabled) return web3LoginMethodsOrdered;

    return showMore
      ? web3LoginMethodsOrdered
      : web3LoginMethodsOrdered.slice(0, maxDisplayedOptions);
  }, [
    web3LoginMethodsOrdered,
    maxDisplayedOptions,
    showMore,
    isShowMoreEnabled,
  ]);

  return (
    <>
      <Header
        title="Welcome"
        description="Login by selecting an option below"
        closable
      />
      <Content className={styles.scrollable}>
        {web3.length ? (
          <Section>
            <Text component="h2">Web3 Wallets</Text>
            <div className={styles.loginOptions}>
              {visibleMethods.map((loginMethod) => (
                <ButtonWithIcon
                  key={loginMethod.id}
                  icon={
                    <img
                      src={getIconsById(loginMethod.id)}
                      alt={`${loginMethod.name} logo`}
                    />
                  }
                  onClick={() => startLoginWith(loginMethod)}
                  disabled={!loginMethod.ready}
                >
                  {loginMethod.name}
                </ButtonWithIcon>
              ))}
            </div>
            {isShowMoreEnabled ? (
              <BaseButton onClick={() => setShowMore((showMore) => !showMore)}>
                {showMore ? 'Back to login options' : 'More Wallets'}
              </BaseButton>
            ) : null}
          </Section>
        ) : null}
        {web2.length ? (
          <Section>
            <Text component="h2">Web2 accounts</Text>
            <div className={styles.loginOptions}>
              {web2.map((loginMethod) => (
                <ButtonWithIcon
                  key={loginMethod.id}
                  icon={
                    <img
                      src={getIconsById(loginMethod.id)}
                      alt={`${loginMethod.name} logo`}
                    />
                  }
                  onClick={() => startLoginWith(loginMethod)}
                  disabled={!loginMethod.ready}
                >
                  {loginMethod.name}
                </ButtonWithIcon>
              ))}
            </div>
          </Section>
        ) : null}
      </Content>
      <Footer />
    </>
  );
};
