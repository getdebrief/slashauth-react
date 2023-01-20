import { classNames } from '../../../../shared/utils/classnames';
import { HighlightedIcon } from './icon';
import { Flex } from './container';
import styles from './button.module.css';

export const BaseButton = <C extends React.ElementType = 'button'>({
  padding,
  wide,
  primary,
  children,
  className,
  component,
  ...props
}: {
  padding?: number;
  wide?: boolean;
  primary?: boolean;
  children?: React.ReactNode;
  className?: string;
  component?: C;
} & React.ComponentPropsWithoutRef<C>) => {
  const Element = component ?? 'button';

  return (
    <Element
      {...props}
      style={{ padding: padding }}
      className={classNames(
        styles.baseButton,
        wide && styles.wide,
        primary && styles.primaryButton,
        className
      )}
    >
      {children}
    </Element>
  );
};

export const ButtonWithIcon = ({ icon, children, ...props }) => (
  <BaseButton {...props} wide padding={12}>
    <Flex gap={17} alignItems="center">
      <HighlightedIcon>{icon}</HighlightedIcon>
      {children}
    </Flex>
  </BaseButton>
);
