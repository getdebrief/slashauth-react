import { ScaleLoader } from 'react-spinners';
import { useAppearance } from '../../context/appearance';

type Props = {
  textContent?: string;
};

export const LoadingModalContents = ({ textContent }: Props) => {
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
        flexDirection: 'column',
      }}
    >
      {textContent ? (
        <h2
          style={{
            marginBottom: '2rem',
            fontSize: '16px',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {textContent}
        </h2>
      ) : null}
      <ScaleLoader
        height={35}
        width={4}
        color={appearance.modalStyle.fontColor}
      />
    </div>
  );
};
