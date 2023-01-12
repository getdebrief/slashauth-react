import { classNames } from '../../../../shared/utils/classnames';
import styles from './text.module.css';

export enum Size {
  Medium,
  Large,
}

export const Text = ({
  size = Size.Medium,
  component,
  children,
  className,
}: {
  size?: Size;
  component?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => {
  const Element = component ?? 'p';

  return (
    <Element
      className={classNames(
        styles.text,
        size === Size.Large && styles.largeText,
        className
      )}
    >
      {children}
    </Element>
  );
};
