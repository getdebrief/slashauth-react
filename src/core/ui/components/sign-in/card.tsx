import { ArrowLeftIcon } from '@heroicons/react/outline';
import { useMemo } from 'react';
import { useAppearance } from '../../context/appearance';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { useRouter } from '../../router/context';
import { useSignInContext } from './context';

type Props = {
  showBackButton?: boolean;
  children: React.ReactNode;
};

const DARK_SLASHAUTH_ICON =
  'https://d1l2xccggl7xwv.cloudfront.net/icons/slashauth-dark.png';

export const SignInCard = ({ showBackButton, children }: Props) => {
  const { viewOnly, appOverride } = useSignInContext();
  const slashAuth = useCoreSlashAuth();
  const { modalStyle } = useAppearance();
  const { navigate } = useRouter();

  const headerTextAlign = useMemo(() => {
    switch (modalStyle.alignItems) {
      case 'flex-start':
        return 'left';
      case 'flex-end':
        return 'right';
      case 'center':
      case undefined:
      case null:
      default:
        return 'center';
    }
  }, [modalStyle.alignItems]);

  const appName = useMemo(() => {
    if (viewOnly && appOverride?.name) {
      return appOverride.name;
    }

    return slashAuth.appName || 'Unnamed App';
  }, [appOverride?.name, slashAuth.appName, viewOnly]);

  return (
    <>
      {showBackButton && (
        <button
          style={{
            backgroundColor: 'transparent',
            color: '#2F5FFC',
            border: 'none',
            position: 'absolute',
            left: '2rem',
            top: '3rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigate('../');
          }}
        >
          <ArrowLeftIcon
            style={{ width: '12px', height: '12px', marginRight: '2px' }}
          />
          Back
        </button>
      )}
      <img
        src={modalStyle.iconURL || DARK_SLASHAUTH_ICON}
        alt="Logo"
        style={{
          borderRadius: '16px',
          width: '48px',
          height: '48px',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <div style={{ marginTop: '1rem', textAlign: headerTextAlign }}>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>{appName}</div>
      </div>
      {children}
    </>
  );
};
