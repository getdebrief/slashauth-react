import { animations } from '../../styles/animation';
import { transitionTiming } from '../../styles/transitions';

type Props = {
  children: React.ReactNode;
  onClickOutside: () => void;
};

export const ModalBackdrop = ({ children, onClickOutside }: Props) => {
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
      animation: `${animations.fadeIn} 150ms ${transitionTiming.common}`,
    }}
    onClick={onClickOutside}
  >
    {children}
  </div>;
};
