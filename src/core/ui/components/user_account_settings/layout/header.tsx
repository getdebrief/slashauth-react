import { classNames } from '../../../../../shared/utils/classnames';
import styles from './header.module.css';
import margin from '../../primitives/margin.module.css';
import { Text, Size, Align } from '../../primitives/text';

export const Header = ({ title, description }) => (
  <header>
    <h1 className={classNames(styles.title, margin.top6)}>{title}</h1>
    <Text className={margin.top2} size={Size.Large} align={Align.Left}>
      {description}
    </Text>
    <hr className={classNames(styles.horizontalDivider, margin.top6)} />
  </header>
);
