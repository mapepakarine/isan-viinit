import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BackupSection from '../components/BackupSection';
import { secondaryButton } from '../components/buttonStyles';
import Section from '../components/Section';
import { db } from '../db/db';
import { removeSampleWines } from '../db/operations';
import { fi } from '../i18n/fi';
import { isStandalone } from '../lib/platform';
import { createSampleWines } from '../lib/sampleWines';
import { requestPersistence, type PersistenceStatus } from '../lib/storage';

const messages: Record<PersistenceStatus, string> = {
  granted: fi.settings.storageGranted,
  denied: fi.settings.storageDenied,
  unsupported: fi.settings.storageUnsupported,
};

export default function Settings() {
  const [status, setStatus] = useState<PersistenceStatus>();
  const sampleCount = useLiveQuery(() =>
    db.wines.filter((wine) => wine.sample === true).count(),
  );

  useEffect(() => {
    void requestPersistence().then(setStatus);
  }, []);

  const installed = isStandalone();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-3xl font-semibold">{fi.titles.settings}</h1>

      <Section title={fi.settings.storageTitle}>
        <p className="text-muted">{status ? messages[status] : fi.settings.storageChecking}</p>
        <p className="mt-2 text-muted">{fi.settings.privacy}</p>
      </Section>

      <Section title={fi.settings.installTitle}>
        <p className={installed ? 'text-muted' : 'font-semibold'}>
          {installed ? fi.settings.installed : fi.settings.notInstalled}
        </p>
        <div className="mt-2 flex justify-end">
          <Link to="/settings/install" className="flex min-h-11 items-center px-1 text-wine underline">
            {fi.settings.installLink}
          </Link>
        </div>
      </Section>

      <Section title={fi.settings.samplesTitle}>
        <p className="text-muted">
          {sampleCount ? fi.settings.samplesAdded(sampleCount) : fi.settings.samplesExplain}
        </p>
        <div className="mt-3 flex justify-end">
          {sampleCount ? (
            <button
              type="button"
              onClick={() => void removeSampleWines()}
              className={secondaryButton}
            >
              {fi.settings.samplesRemove}
            </button>
          ) : (
            <button
              type="button"
              disabled={sampleCount === undefined}
              onClick={() => void db.wines.bulkAdd(createSampleWines(new Date()))}
              className={secondaryButton}
            >
              {fi.settings.samplesAdd}
            </button>
          )}
        </div>
      </Section>

      {/* Last on the page, so its buttons sit nearest the thumb. */}
      <Section title={fi.backup.title}>
        <BackupSection />
      </Section>
    </div>
  );
}
