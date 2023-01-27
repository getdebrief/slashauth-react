import { classNames } from '../../../../../shared/utils/classnames';
import styles from './edit_name.module.css';
import margin from '../../primitives/margin.module.css';
import * as Input from '../../primitives/input';
import { BaseButton } from '../../primitives/button';
import { Flex } from '../../primitives/container';
import { Header } from '../layout/header';
import { useState } from 'react';

export const EditNameScreen = ({ name, backToSettings, save }) => {
  const [value, setValue] = useState(name || '');

  return (
    <>
      <Header
        title="Add your name"
        description="This will be your primary identifier."
      />
      <div>
        <Input.Label htmlFor="name">Name</Input.Label>
        <Input.Input
          className={margin.top2}
          required
          type="text"
          name="name"
          placeholder="Type your name here..."
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      </div>
      <hr className={classNames(styles.horizontalDivider, margin.top6)} />
      <Flex alignItems="center" justifyContent="space-between">
        <div>
          <BaseButton onClick={backToSettings}>Back to settings</BaseButton>
        </div>
        <div>
          <BaseButton
            component="input"
            value="Save"
            type="submit"
            primary
            onClick={() => save(value)}
          />
        </div>
      </Flex>
    </>
  );
};
