import { useRegisterSW } from 'virtual:pwa-register/react';
import { fi } from '../i18n/fi';

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div role="status" className="bg-wine-dark px-4 py-3 text-white">
      <p className="font-semibold">{fi.update.message}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="min-h-11 flex-1 rounded-lg bg-white px-4 font-bold text-wine-dark"
        >
          {fi.update.action}
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="min-h-11 flex-1 rounded-lg border border-white px-4 font-semibold"
        >
          {fi.update.dismiss}
        </button>
      </div>
    </div>
  );
}
