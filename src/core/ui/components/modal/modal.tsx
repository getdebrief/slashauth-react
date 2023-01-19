import { useSafeLayoutEffect } from '../../../../shared/hooks';
import { useAppearance } from '../../context/appearance';
import { usePopover, useScrollLock } from '../../hooks';
import { BasicPortal } from '../../portal';
import { ModalBackdrop } from './backdrop';
import { ModalContent } from './modal-content';

export const Modal = ({ children }) => {
  const { floating } = usePopover({
    defaultOpen: true,
    autoUpdate: false,
  });

  const { disableScroll, enableScroll } = useScrollLock(document.body);

  const appearance = useAppearance();

  useSafeLayoutEffect(() => {
    disableScroll();
    return () => enableScroll();
  });

  return (
    <BasicPortal>
      <ModalBackdrop
        aria-hidden
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <ModalContent ref={floating} modalStyles={appearance.modalStyle}>
          {children}
        </ModalContent>
      </ModalBackdrop>
    </BasicPortal>
  );
};
