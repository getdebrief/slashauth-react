import { useAppearance } from '../context/appearance';

export const DARK_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';
export const LIGHT_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-light.png';

export const AppLogo = () => {
  const appearance = useAppearance();

  return (
    <img
      src={appearance.modalStyle.iconURL || DARK_SLASHAUTH_ICON}
      alt="Logo"
      style={{
        borderRadius: '16px',
        width: '48px',
        height: '48px',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
    />
  );
};
