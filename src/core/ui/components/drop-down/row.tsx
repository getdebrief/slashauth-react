import { classNames } from '../../../../shared/utils/classnames';
import styles from './styles.module.css';

export const Row = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, onClick, ...props } = props_;
  return (
    <div
      className={classNames(styles.dropDownRow, onClick && styles.clickable)}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
      {...props}
    />
  );
};
