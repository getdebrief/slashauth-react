import { ScaleLoader } from 'react-spinners';

type Props = {
  textColor: string;
};

export const LoadingModalContents = ({ textColor }: Props) => {
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
      <ScaleLoader height={35} width={4} color={textColor} />
    </div>
  );
};
