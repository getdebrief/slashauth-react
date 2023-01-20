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
import { useAppearance } from '../../../context/appearance';
import { ReactEventHandler } from 'react';

export const LoadingScreen = ({
  navigateBack,
  loading,
  description,
  detailedDescription,
}: {
  navigateBack: ReactEventHandler;
  loading?: boolean;
  description: string;
  detailedDescription: string | React.ReactNode;
}) => {
  const { selectedLoginMethod } = useLoginMethods();
  const appearance = useAppearance();

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
            {loading ? (
              <Loader color={appearance.modalStyle.fontColor} size={8} />
            ) : (
              <span className={styles.icon}>
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 3C4.44772 3 4 3.44771 4 4C4 4.55228 4.44772 5 5 5L10.5858 5L9.29289 6.29289C8.90237 6.68342 8.90237 7.31658 9.29289 7.70711C9.68342 8.09763 10.3166 8.09763 10.7071 7.70711L13.7071 4.70711C13.8946 4.51957 14 4.26522 14 4C14 3.73478 13.8946 3.48043 13.7071 3.29289L10.7071 0.292893C10.3166 -0.0976311 9.68342 -0.0976311 9.29289 0.292893C8.90237 0.683417 8.90237 1.31658 9.29289 1.70711L10.5858 3L5 3Z"
                    fill="#032DB8"
                  />
                  <path
                    d="M9 13C9.55228 13 10 12.5523 10 12C10 11.4477 9.55228 11 9 11L3.41421 11L4.70711 9.70711C5.09763 9.31658 5.09763 8.68342 4.70711 8.29289C4.31658 7.90237 3.68342 7.90237 3.29289 8.29289L0.292892 11.2929C0.105356 11.4804 1.1593e-08 11.7348 0 12C-1.1593e-08 12.2652 0.105356 12.5196 0.292892 12.7071L3.29289 15.7071C3.68342 16.0976 4.31658 16.0976 4.70711 15.7071C5.09763 15.3166 5.09763 14.6834 4.70711 14.2929L3.41421 13L9 13Z"
                    fill="#032DB8"
                  />
                </svg>
              </span>
            )}
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
            {description}
          </Text>
          {/* TODO: SLA-1968 - Add centered property to text component */}
          <Text
            className={classNames(
              text.centered,
              margin.top2,
              styles.detailedDescription
            )}
          >
            {detailedDescription}
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
