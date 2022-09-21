import { transitionTiming } from '../../styles/transitions';

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

export const ModalBackdrop = ({ children, onClick }: Props) => {
  return (
    <div
      style={{
        zIndex: 1000,
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflow: 'auto',
        width: '100vw',
        // TODO: Figure out how we can pass both height: 100vh and height: -webkit-fill-available
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(35, 35, 35, 0.5)',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
