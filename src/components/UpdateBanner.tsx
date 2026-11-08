import { useRegisterSW } from 'virtual:pwa-register/react';
import { fi } from '../i18n/fi';
import { primaryButton, secondaryButton } from './buttonStyles';

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[406px] rounded-2xl border border-line bg-white p-4 shadow-lg"
    >
      <p className="font-semibold">{fi.update.message}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className={`${secondaryButton} flex-1`}
        >
          {fi.update.dismiss}
        </button>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className={`${primaryButton} flex-1`}
        >
          {fi.update.action}
        </button>
      </div>
    </div>
  );
}
