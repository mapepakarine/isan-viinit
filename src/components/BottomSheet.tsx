import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  /** Buttons; the main action goes last, on the right, under the thumb. */
  footer: ReactNode;
  onClose: () => void;
}

/** Slides up from the bottom so every choice is within reach of the thumb. */
export default function BottomSheet({ title, children, footer, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  // A tap on the dimmed area outside the sheet lands on the dialog element itself.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) onClose();
  };

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onClose={onClose}
      onClick={handleClick}
      className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-[430px] rounded-t-3xl bg-cream p-0 text-ink backdrop:bg-black/40"
    >
      <div className="px-4 pt-5 pb-3">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-cream px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {footer}
      </div>
    </dialog>
  );
}
