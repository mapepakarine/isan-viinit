import type { ReactNode } from 'react';

/** The thumb-reachable bar at the bottom of a screen. Put the main action last, on the right. */
export default function BottomBar({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div
      role={label ? 'navigation' : undefined}
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-[430px] items-center gap-2 border-t border-line bg-cream px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {children}
    </div>
  );
}
