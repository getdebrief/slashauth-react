import styles from './styles.module.css';

export const Section = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, ...props } = props_;
  return (
    <div
      className={styles.dropDownSection}
      style={{
        ...style,
      }}
      {...props}
    />
  );
};
