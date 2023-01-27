import { classNames } from '../../../../shared/utils/classnames';
import { profilePicturePlaceholder } from '../drop-down/icons/profilePicturePlaceholder';
import styles from './avatar.module.css';

export const Avatar = ({ className, src, onClick }) => {
  const objectProps: React.ComponentPropsWithoutRef<'object'> = {};

  if (src) {
    objectProps.data = src;
    objectProps.type = 'image/jpg';
  }

  return (
    <div
      className={classNames(
        styles.avatar,
        onClick && styles.clickableAvatar,
        className
      )}
    >
      <object {...objectProps}>{profilePicturePlaceholder}</object>
    </div>
  );
};
