import { Text } from './text';
import margin from './margin.module.css';
import { classNames } from '../../../../shared/utils/classnames';
import styles from './input.module.css';
import error from './error.module.css';
import { useState } from 'react';

const Label = ({ htmlFor, children }) => (
  <Text component="label" htmlFor={htmlFor} className={styles.label}>
    {children}
  </Text>
);

Label.displayName = 'Input.Label';

/**
 * Uncontrolled Input component
 */
const Input = ({
  valid = true,
  name,
  type = 'text',
  placeholder,
  ...props
}) => (
  <input
    {...props}
    className={classNames(styles.input, !valid && styles.invalid)}
    id={name}
    type={type}
    autoComplete={name}
    name={name}
    placeholder={placeholder}
  />
);

const ErrorMessage = ({ children }) => (
  <Text className={classNames(error.message, margin.top2)}>{children}</Text>
);

ErrorMessage.displayName = 'Input.ErrorMessage';

export const EmailInput = () => {
  const [error, setError] = useState(null);

  const updateError = (event: React.SyntheticEvent) => {
    if (event.target instanceof HTMLInputElement) {
      setError(event.target.validationMessage);
    }

    event.preventDefault();
  };

  const listeners: { onInvalid; onChange? } = {
    onInvalid: updateError,
  };

  if (error) {
    listeners.onChange = updateError;
  }

  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        required
        type="email"
        name="email"
        placeholder="Type your email here..."
        valid={!error}
        {...listeners}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};
