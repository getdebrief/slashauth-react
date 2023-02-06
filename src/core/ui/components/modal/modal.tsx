import { useEffect } from 'react';
import { useSafeLayoutEffect } from '../../../../shared/hooks';
import { useAppearance } from '../../context/appearance';
import { usePopover, useScrollLock } from '../../hooks';
import { BasicPortal } from '../../portal';
import { ModalBackdrop } from './backdrop';
import { ModalContent } from './modal-content';

export const Modal = ({
  children,
  handleClose,
  handleOpen,
}: React.PropsWithChildren<{
  handleOpen?: () => void;
  handleClose?: () => void;
}>) => {
  const { floating, isOpen } = usePopover({
    defaultOpen: true,
    autoUpdate: false,
  });

  useEffect(() => {
    if (!isOpen) {
      handleClose?.();
    } else {
      handleOpen?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { disableScroll, enableScroll } = useScrollLock(document.body);

  const appearance = useAppearance();

  useSafeLayoutEffect(() => {
    disableScroll();
    return () => enableScroll();
  });

  if (!isOpen) {
    return null;
  }

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
