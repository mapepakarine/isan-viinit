import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ChangeEvent } from 'react';
import { db } from '../db/db';
import { applyMerge, getLastBackupAt, replaceAllWines, setLastBackupAt } from '../db/operations';
import { fi } from '../i18n/fi';
import type { DeliveryResult, ParsedBackup } from '../lib/backup';
import { formatDate } from '../lib/format';
import { toLocalIsoDate } from '../lib/wineForm';
import BottomSheet from './BottomSheet';
import { primaryButton, secondaryButton } from './buttonStyles';

// Loaded on demand so the zip library doesn't slow down app start; precached for offline use.
const loadBackup = () => import('../lib/backup');

type Message = { kind: 'ok' | 'error'; text: string };

function localDate(iso: string): string {
  return formatDate(toLocalIsoDate(new Date(iso)));
}

export default function BackupSection() {
  const wineCount = useLiveQuery(() => db.wines.count());
  const lastBackupAt = useLiveQuery(getLastBackupAt);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>();
  const [pendingFile, setPendingFile] = useState<Blob>();
  const [parsed, setParsed] = useState<ParsedBackup>();
  const [confirmingReplace, setConfirmingReplace] = useState(false);

  const finishDelivery = async (result: DeliveryResult, blob: Blob) => {
    if (result === 'needsTap') {
      setPendingFile(blob);
      return;
    }
    setPendingFile(undefined);
    if (result === 'cancelled') return;
    await setLastBackupAt(new Date().toISOString());
    setMessage({
      kind: 'ok',
      text: result === 'shared' ? fi.backup.shared : fi.backup.downloaded,
    });
  };

  const fileName = () => fi.backup.fileName(toLocalIsoDate(new Date()));

  const handleExport = async () => {
    setBusy(true);
    setMessage(undefined);
    try {
      const { createBackup, deliverBackup } = await loadBackup();
      const blob = await createBackup(await db.wines.toArray(), new Date());
      await finishDelivery(await deliverBackup(blob, fileName()), blob);
    } catch {
      setMessage({ kind: 'error', text: fi.backup.exportFailed });
    } finally {
      setBusy(false);
    }
  };

  const handleDeliverPending = async () => {
    if (!pendingFile) return;
    try {
      const { deliverBackup } = await loadBackup();
      await finishDelivery(await deliverBackup(pendingFile, fileName()), pendingFile);
    } catch {
      setMessage({ kind: 'error', text: fi.backup.exportFailed });
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setMessage(undefined);
    try {
      const { parseBackup, BackupError } = await loadBackup();
      try {
        setParsed(await parseBackup(file));
      } catch (error) {
        const tooNew = error instanceof BackupError && error.kind === 'tooNew';
        setMessage({ kind: 'error', text: tooNew ? fi.backup.tooNew : fi.backup.notBackup });
      }
    } catch {
      setMessage({ kind: 'error', text: fi.backup.importFailed });
    } finally {
      setBusy(false);
    }
  };

  const closeSheet = () => {
    setParsed(undefined);
    setConfirmingReplace(false);
  };

  const handleMerge = async () => {
    if (!parsed) return;
    setBusy(true);
    try {
      const { planMerge } = await loadBackup();
      const plan = planMerge(await db.wines.toArray(), parsed.wines);
      await applyMerge(plan);
      setMessage({ kind: 'ok', text: fi.backup.merged(plan.add.length, plan.update.length) });
    } catch {
      setMessage({ kind: 'error', text: fi.backup.importFailed });
    } finally {
      closeSheet();
      setBusy(false);
    }
  };

  const handleReplace = async () => {
    if (!parsed) return;
    setBusy(true);
    try {
      await replaceAllWines(parsed.wines);
      setMessage({ kind: 'ok', text: fi.backup.replaced(parsed.wines.length) });
    } catch {
      setMessage({ kind: 'error', text: fi.backup.importFailed });
    } finally {
      closeSheet();
      setBusy(false);
    }
  };

  const hasWines = (wineCount ?? 0) > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted">
        {lastBackupAt ? fi.backup.last(localDate(lastBackupAt)) : fi.backup.never}
      </p>
      <p className="text-muted">{fi.backup.explain}</p>

      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`font-semibold ${message.kind === 'error' ? 'text-danger' : ''}`}
        >
          {message.text}
        </p>
      )}

      {pendingFile && (
        <button type="button" onClick={handleDeliverPending} className={primaryButton}>
          {fi.backup.saveReady}
        </button>
      )}

      <div className="flex gap-2">
        <label
          className={`${secondaryButton} flex-1 has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2`}
        >
          {fi.backup.restore}
          <input
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            disabled={busy}
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy || !hasWines}
          className={`${primaryButton} flex-[1.8] !px-3`}
        >
          {busy ? fi.backup.working : fi.backup.create}
        </button>
      </div>

      {parsed && (
        <BottomSheet
          title={fi.backup.restoreTitle}
          onClose={closeSheet}
          footer={
            confirmingReplace ? (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmingReplace(false)}
                  className={`${secondaryButton} flex-1`}
                >
                  {fi.form.deleteNo}
                </button>
                <button
                  type="button"
                  onClick={handleReplace}
                  disabled={busy}
                  className={`${primaryButton} flex-[1.4] !bg-danger`}
                >
                  {fi.backup.replaceYes}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={closeSheet} className={`${secondaryButton} flex-1`}>
                  {fi.form.deleteNo}
                </button>
                <button
                  type="button"
                  onClick={hasWines ? handleMerge : handleReplace}
                  disabled={busy}
                  className={`${primaryButton} flex-[1.4]`}
                >
                  {hasWines ? fi.backup.merge : fi.backup.restoreAction}
                </button>
              </>
            )
          }
        >
          <p>{fi.backup.contents(parsed.wines.length, parsed.photoCount)}</p>
          {parsed.exportedAt && (
            <p className="mt-1 text-muted">{fi.backup.madeOn(localDate(parsed.exportedAt))}</p>
          )}
          {hasWines &&
            (confirmingReplace ? (
              <p role="alert" className="mt-3 font-semibold text-danger">
                {fi.backup.replaceWarning(wineCount ?? 0, parsed.wines.length)}
              </p>
            ) : (
              <>
                <p className="mt-3 text-muted">{fi.backup.mergeExplain(wineCount ?? 0)}</p>
                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmingReplace(true)}
                    className="min-h-11 px-1 text-danger underline"
                  >
                    {fi.backup.replace}
                  </button>
                </div>
              </>
            ))}
        </BottomSheet>
      )}
    </div>
  );
}
