import { ScaleLoader } from 'react-spinners';
import { useAppearance } from '../../context/appearance';

export const LoadingModalContents = () => {
  const appearance = useAppearance();

  return (
    <div
      style={{
        minHeight: '200px',
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ScaleLoader
        height={35}
        width={4}
        color={appearance.modalStyle.fontColor}
      />
    </div>
  );
};
