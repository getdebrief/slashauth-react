import { ScaleLoader } from 'react-spinners';
import { useAppearance } from '../../context/appearance';

type Props = {
  textColor: string;
};

export const LoadingModalContents = () => {
  const appearance = useAppearance();

  return (
    <div
      style={{
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
