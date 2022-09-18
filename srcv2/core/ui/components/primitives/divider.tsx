import { Flex } from './flex';
import { Text } from './text';

type Props = {
  dividerText?: string;
};

export const Divider = ({ dividerText }: Props) => {
  return (
    <Flex>
      <DividerLine />
      {!!dividerText && (
        <Text size="sm" style={{ marginTop: '1rem' }}>
          {dividerText}
        </Text>
      )}
      <DividerLine />
    </Flex>
  );
};

const DividerLine = () => {
  return <Flex style={{ height: '1px', color: 'rgba(0, 0, 0, 0.3)' }} />;
};
