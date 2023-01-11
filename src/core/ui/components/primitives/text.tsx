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
}: {
  size?: Size;
  component?: React.ElementType;
  children: React.ReactNode;
}) => {
  const Element = component ?? 'p';

  return (
    <Element
      className={classNames(
        styles.text,
        size === Size.Large && styles.largeText
      )}
    >
      {children}
    </Element>
  );
};
