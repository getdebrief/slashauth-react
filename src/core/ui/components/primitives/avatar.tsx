import { ChangeEvent, useCallback, useState } from 'react';
import { classNames } from '../../../../shared/utils/classnames';
import { profilePicturePlaceholder } from '../drop-down/icons/profilePicturePlaceholder';
import styles from './avatar.module.css';

export const Avatar = ({ className, src, onChange }) => {
  const objectProps: React.ComponentPropsWithoutRef<'object'> = {};
  const [localImageSrc, setLocalImage] = useState(null);

  if (src) {
    objectProps.data = src;
    objectProps.type = 'image/jpg';
  }

  const handleInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        const file = e.target.files[0];

        if (!file) {
          return;
        }

        setLocalImage(URL.createObjectURL(file));
        onChange(file);
      }
    },
    [onChange]
  );

  return (
    <div
      className={classNames(
        styles.avatar,
        onChange && styles.clickableAvatar,
        className
      )}
    >
      <object {...objectProps}>
        {localImageSrc ? (
          <img src={localImageSrc} alt="User selected avatar" />
        ) : (
          profilePicturePlaceholder
        )}
      </object>
      {onChange && (
        <input type="file" accept="image/*" onChange={handleInputChange} />
      )}
    </div>
  );
};
