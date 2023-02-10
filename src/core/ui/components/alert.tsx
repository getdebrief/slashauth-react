import { ExclamationCircleIcon } from './icon/exclamation_circle';

type Props = {
  children: React.ReactNode;
};

export const Alert = ({ children }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <ExclamationCircleIcon
        style={{
          color: 'red',
        }}
      />
      <div
        style={{
          color: 'black',
          fontSize: '18px',
          fontWeight: 500,
        }}
      >
        {children}
      </div>
    </div>
  );
};
