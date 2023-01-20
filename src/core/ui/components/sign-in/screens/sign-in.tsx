import { Header } from '../layout/header';
import { Content, Section } from '../layout/content';
import { Footer } from '../layout/footer';
import { ButtonWithIcon } from '../../primitives/button';
import { Text } from '../../primitives/text';
import styles from './sign-in.module.css';
import { useLoginMethods, getIconsById } from '../../../context/login-methods';

export const SignInScreen = ({ startLoginWith }) => {
  const { web3, web2 } = useLoginMethods();

  return (
    <>
      <Header
        title="Welcome"
        description="Login by selecting an option below"
      />
      <Content>
        {web3.length ? (
          <Section>
            <Text component="h2">Web3 Wallets</Text>
            <div className={styles.loginOptions}>
              {web3.map((loginMethod) => (
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
