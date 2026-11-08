import { useEffect, useState } from 'react';
import { fi } from '../i18n/fi';
import { requestPersistence, type PersistenceStatus } from '../lib/storage';

const messages: Record<PersistenceStatus, string> = {
  granted: fi.settings.storageGranted,
  denied: fi.settings.storageDenied,
  unsupported: fi.settings.storageUnsupported,
};

export default function Settings() {
  const [status, setStatus] = useState<PersistenceStatus>();

  useEffect(() => {
    void requestPersistence().then(setStatus);
  }, []);

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">{fi.titles.settings}</h1>
      <h2 className="mt-5 font-semibold">{fi.settings.storageTitle}</h2>
      <p className="mt-1 text-muted">{status ? messages[status] : fi.settings.storageChecking}</p>
    </>
  );
}
