import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';
import type { Wine } from '../db/types';
import { BackupError, createBackup, deliverBackup, parseBackup, planMerge } from './backup';

const now = new Date('2026-11-08T10:00:00.000Z');

function wine(overrides: Partial<Wine> = {}): Wine {
  return {
    id: 1,
    name: 'Testiviini',
    type: 'red',
    buyAgain: false,
    tastedAt: '2026-11-01',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

const jpeg = (text: string) => new Blob([text], { type: 'image/jpeg' });

async function zipWith(files: Record<string, string>): Promise<Blob> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) zip.file(path, content);
  return new Blob([await zip.generateAsync({ type: 'arraybuffer' })]);
}

const backupJson = (wines: unknown, version = 1) =>
  JSON.stringify({ version, exportedAt: now.toISOString(), wines });

describe('backup round trip', () => {
  it('restores every field and photo exactly', async () => {
    const full = wine({
      id: 7,
      producer: 'Tuottaja',
      type: 'white',
      grape: 'Riesling',
      country: 'Saksa',
      region: 'Mosel',
      vintage: 2021,
      price: 12.9,
      store: 'Alko',
      rating: 4,
      notes: 'Rivi 1\nÄäkköset ja € toimivat',
      food: 'Kala',
      buyAgain: true,
      photo: jpeg('photo bytes'),
      thumb: jpeg('thumb bytes'),
    });
    const sparse = wine({ id: 9, name: 'Pelkkä nimi' });

    const parsed = await parseBackup(await createBackup([full, sparse], now));

    expect(parsed.exportedAt).toBe(now.toISOString());
    expect(parsed.photoCount).toBe(1);
    expect(parsed.wines).toHaveLength(2);

    const [restoredFull, restoredSparse] = parsed.wines;
    const { photo, thumb, ...fields } = restoredFull;
    const { photo: _p, thumb: _t, ...expectedFields } = full;
    expect(fields).toEqual(expectedFields);
    expect(await photo!.text()).toBe('photo bytes');
    expect(await thumb!.text()).toBe('thumb bytes');
    expect(photo!.type).toBe('image/jpeg');
    expect(restoredSparse).toEqual(sparse);
    expect('photo' in restoredSparse).toBe(false);
  });

  it('survives an empty journal', async () => {
    const parsed = await parseBackup(await createBackup([], now));
    expect(parsed.wines).toEqual([]);
  });

  it('stores photos under the agreed paths', async () => {
    const blob = await createBackup([wine({ id: 3, photo: jpeg('p'), thumb: jpeg('t') })], now);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(Object.keys(zip.files).filter((path) => !path.endsWith('/')).sort()).toEqual([
      'photos/3.jpg',
      'thumbs/3.jpg',
      'wines.json',
    ]);
    expect(blob.type).toBe('application/zip');
  });
});

describe('parseBackup rejects bad files without touching anything', () => {
  const rejectsWith = async (blob: Blob, kind: string) => {
    const error = await parseBackup(blob).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BackupError);
    expect((error as BackupError).kind).toBe(kind);
  };

  it('a file that is not a zip', () => rejectsWith(new Blob(['hello']), 'notBackup'));
  it('a zip without wines.json', () => zipWith({ 'a.txt': 'x' }).then((b) => rejectsWith(b, 'notBackup')));
  it('broken JSON', () => zipWith({ 'wines.json': '{oops' }).then((b) => rejectsWith(b, 'notBackup')));
  it('wines that is not a list', () =>
    zipWith({ 'wines.json': backupJson('nope') }).then((b) => rejectsWith(b, 'notBackup')));
  it('a newer format', () =>
    zipWith({ 'wines.json': backupJson([], 99) }).then((b) => rejectsWith(b, 'tooNew')));

  it.each([
    ['missing name', { ...wine(), name: '' }],
    ['unknown type', { ...wine(), type: 'beer' }],
    ['bad rating', { ...wine(), rating: 9 }],
    ['text price', { ...wine(), price: '12' }],
    ['bad date', { ...wine(), tastedAt: 'eilen' }],
    ['bad id', { ...wine(), id: 'x' }],
  ])('a wine with %s', async (_label, bad) => {
    await rejectsWith(await zipWith({ 'wines.json': backupJson([bad]) }), 'notBackup');
  });

  it('two wines with the same id', async () => {
    await rejectsWith(await zipWith({ 'wines.json': backupJson([wine(), wine()]) }), 'notBackup');
  });
});

describe('parseBackup is strict about what it keeps', () => {
  it('ignores unknown fields and files', async () => {
    const blob = await zipWith({
      'wines.json': backupJson([{ ...wine(), evil: 'x' }]),
      '../../outside.txt': 'x',
    });
    const parsed = await parseBackup(blob);
    expect(parsed.wines[0]).toEqual(wine());
  });
});

describe('planMerge', () => {
  it('adds unknown wines without their old id, so nothing gets overwritten', () => {
    const existing = [wine({ id: 1, createdAt: 'a' })];
    const incoming = [wine({ id: 1, name: 'Uusi', createdAt: 'b' })];
    const plan = planMerge(existing, incoming);
    expect(plan.add).toHaveLength(1);
    expect(plan.add[0].name).toBe('Uusi');
    expect('id' in plan.add[0]).toBe(false);
    expect(plan.update).toEqual([]);
    expect(plan.unchanged).toBe(0);
  });

  it('updates a known wine when the backup is newer, keeping the local id', () => {
    const existing = [wine({ id: 5, createdAt: 'a', updatedAt: '2026-01-01T00:00:00.000Z' })];
    const incoming = [
      wine({ id: 9, name: 'Uudempi', createdAt: 'a', updatedAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const plan = planMerge(existing, incoming);
    expect(plan.update).toHaveLength(1);
    expect(plan.update[0].id).toBe(5);
    expect(plan.update[0].name).toBe('Uudempi');
  });

  it('keeps the local wine when it is the same age or newer', () => {
    const existing = [
      wine({ id: 1, createdAt: 'a', updatedAt: '2026-03-01T00:00:00.000Z' }),
      wine({ id: 2, createdAt: 'b', updatedAt: '2026-03-01T00:00:00.000Z' }),
    ];
    const incoming = [
      wine({ id: 1, createdAt: 'a', updatedAt: '2026-01-01T00:00:00.000Z' }),
      wine({ id: 2, createdAt: 'b', updatedAt: '2026-03-01T00:00:00.000Z' }),
    ];
    const plan = planMerge(existing, incoming);
    expect(plan.add).toEqual([]);
    expect(plan.update).toEqual([]);
    expect(plan.unchanged).toBe(2);
  });

  it('merging the same backup twice changes nothing the second time', () => {
    const incoming = [wine({ id: 1, createdAt: 'a' })];
    const afterFirst = planMerge([], incoming).add.map((w, i) => ({ ...w, id: i + 1 }));
    const second = planMerge(afterFirst, incoming);
    expect(second.add).toEqual([]);
    expect(second.update).toEqual([]);
  });
});

describe('deliverBackup', () => {
  const blob = new Blob(['zip'], { type: 'application/zip' });
  const named = (name: string, message = '') => Object.assign(new Error(message), { name });

  it('uses the share sheet when files can be shared', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const download = vi.fn();
    const result = await deliverBackup(blob, 'a.zip', { canShare: () => true, share, download });
    expect(result).toBe('shared');
    expect(share.mock.calls[0][0].files[0].name).toBe('a.zip');
    expect(download).not.toHaveBeenCalled();
  });

  it('downloads when sharing files is unavailable', async () => {
    const download = vi.fn();
    expect(await deliverBackup(blob, 'a.zip', { download })).toBe('downloaded');
    const refuses = { canShare: () => false, share: vi.fn(), download };
    expect(await deliverBackup(blob, 'a.zip', refuses)).toBe('downloaded');
    expect(refuses.share).not.toHaveBeenCalled();
    expect(download).toHaveBeenCalledTimes(2);
  });

  it('reports a cancelled share sheet instead of counting it as a backup', async () => {
    const share = vi.fn().mockRejectedValue(named('AbortError'));
    const download = vi.fn();
    const result = await deliverBackup(blob, 'a.zip', { canShare: () => true, share, download });
    expect(result).toBe('cancelled');
    expect(download).not.toHaveBeenCalled();
  });

  it('asks for a new tap when the browser needs a fresh gesture', async () => {
    const share = vi.fn().mockRejectedValue(named('NotAllowedError'));
    const download = vi.fn();
    const result = await deliverBackup(blob, 'a.zip', { canShare: () => true, share, download });
    expect(result).toBe('needsTap');
    expect(download).not.toHaveBeenCalled();
  });

  it('falls back to a download when sharing fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(named('TypeError'));
    const download = vi.fn();
    const result = await deliverBackup(blob, 'a.zip', { canShare: () => true, share, download });
    expect(result).toBe('downloaded');
    expect(download).toHaveBeenCalledOnce();
  });
});
