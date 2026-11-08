import JSZip from 'jszip';
import type { Rating, Wine, WineType } from '../db/types';

const FORMAT_VERSION = 1;
const WINES_FILE = 'wines.json';
const WINE_TYPES: WineType[] = ['red', 'white', 'rose', 'sparkling', 'dessert', 'other'];
const TEXT_FIELDS = ['producer', 'grape', 'country', 'region', 'store', 'notes', 'food'] as const;

export type BackupErrorKind = 'notBackup' | 'tooNew';

export class BackupError extends Error {
  readonly kind: BackupErrorKind;

  constructor(kind: BackupErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

export interface ParsedBackup {
  wines: Wine[];
  exportedAt?: string;
  photoCount: number;
}

const photoPath = (id: number) => `photos/${id}.jpg`;
const thumbPath = (id: number) => `thumbs/${id}.jpg`;

export async function createBackup(wines: Wine[], now: Date): Promise<Blob> {
  const zip = new JSZip();
  const data = wines.map(({ photo: _photo, thumb: _thumb, ...fields }) => fields);
  zip.file(
    WINES_FILE,
    JSON.stringify({ version: FORMAT_VERSION, exportedAt: now.toISOString(), wines: data }, null, 2),
  );

  for (const wine of wines) {
    if (wine.photo) zip.file(photoPath(wine.id!), await wine.photo.arrayBuffer());
    if (wine.thumb) zip.file(thumbPath(wine.id!), await wine.thumb.arrayBuffer());
  }

  // JPEGs don't compress further, so storing them as they are keeps this quick on a phone.
  const bytes = await zip.generateAsync({ type: 'arraybuffer', compression: 'STORE' });
  return new Blob([bytes], { type: 'application/zip' });
}

/** Keeps only known fields, and throws if the wine isn't one the app could have written. */
function readWine(raw: unknown): Wine & { id: number } {
  const bad = () => new BackupError('notBackup');
  if (typeof raw !== 'object' || raw === null) throw bad();
  const source = raw as Record<string, unknown>;

  const { id, name, type, buyAgain, tastedAt, createdAt, updatedAt } = source;
  if (!Number.isInteger(id) || (id as number) <= 0) throw bad();
  if (typeof name !== 'string' || !name.trim()) throw bad();
  if (!WINE_TYPES.includes(type as WineType)) throw bad();
  if (typeof buyAgain !== 'boolean') throw bad();
  if (typeof tastedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tastedAt)) throw bad();
  if (typeof createdAt !== 'string' || typeof updatedAt !== 'string') throw bad();

  const wine: Wine & { id: number } = {
    id: id as number,
    name,
    type: type as WineType,
    buyAgain,
    tastedAt,
    createdAt,
    updatedAt,
  };

  for (const field of TEXT_FIELDS) {
    const value = source[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') throw bad();
    wine[field] = value;
  }

  const { vintage, price, rating, sample } = source;
  if (vintage !== undefined && vintage !== null) {
    if (!Number.isInteger(vintage)) throw bad();
    wine.vintage = vintage as number;
  }
  if (price !== undefined && price !== null) {
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) throw bad();
    wine.price = price;
  }
  if (rating !== undefined && rating !== null) {
    if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) throw bad();
    wine.rating = rating as Rating;
  }
  if (sample === true) wine.sample = true;
  return wine;
}

/** Reads and fully checks a backup. Nothing is stored here, so a bad file can't harm any data. */
export async function parseBackup(file: Blob): Promise<ParsedBackup> {
  let zip: JSZip;
  let content: { version?: unknown; exportedAt?: unknown; wines?: unknown };
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
    const json = await zip.file(WINES_FILE)?.async('string');
    if (json === undefined) throw new Error('missing');
    content = JSON.parse(json) as typeof content;
  } catch {
    throw new BackupError('notBackup');
  }

  if (typeof content.version === 'number' && content.version > FORMAT_VERSION) {
    throw new BackupError('tooNew');
  }
  if (content.version !== FORMAT_VERSION || !Array.isArray(content.wines)) {
    throw new BackupError('notBackup');
  }

  const wines = content.wines.map(readWine);
  if (new Set(wines.map((wine) => wine.id)).size !== wines.length) {
    throw new BackupError('notBackup');
  }

  const readImage = async (path: string): Promise<Blob | undefined> => {
    const entry = zip.file(path);
    if (!entry) return undefined;
    return new Blob([await entry.async('arraybuffer')], { type: 'image/jpeg' });
  };

  let photoCount = 0;
  for (const wine of wines) {
    const photo = await readImage(photoPath(wine.id));
    const thumb = await readImage(thumbPath(wine.id));
    if (photo) {
      wine.photo = photo;
      photoCount += 1;
    }
    if (thumb) wine.thumb = thumb;
  }

  return {
    wines,
    exportedAt: typeof content.exportedAt === 'string' ? content.exportedAt : undefined,
    photoCount,
  };
}

export interface MergePlan {
  add: Wine[];
  update: Wine[];
  unchanged: number;
}

/**
 * A wine keeps its createdAt for life, which identifies it across phones; ids don't, because
 * each phone assigns its own. The newer edit wins, so merging can't lose newer local changes.
 */
export function planMerge(existing: Wine[], incoming: Wine[]): MergePlan {
  const local = new Map(existing.map((wine) => [wine.createdAt, wine]));
  const plan: MergePlan = { add: [], update: [], unchanged: 0 };

  for (const wine of incoming) {
    const match = local.get(wine.createdAt);
    if (!match) {
      const { id: _id, ...withoutId } = wine;
      plan.add.push(withoutId);
    } else if (wine.updatedAt > match.updatedAt) {
      plan.update.push({ ...wine, id: match.id });
    } else {
      plan.unchanged += 1;
    }
  }
  return plan;
}

export type DeliveryResult = 'shared' | 'downloaded' | 'cancelled' | 'needsTap';

export interface DeliveryEnv {
  canShare?: (data: { files: File[] }) => boolean;
  share?: (data: { files: File[] }) => Promise<void>;
  download: (file: File) => void;
}

function browserDownload(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  // Revoking straight away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function browserEnv(): DeliveryEnv {
  return {
    canShare: navigator.canShare?.bind(navigator),
    share: navigator.share?.bind(navigator),
    download: browserDownload,
  };
}

/** Hands the file to the phone's share sheet where possible, otherwise downloads it. */
export async function deliverBackup(
  blob: Blob,
  fileName: string,
  env: DeliveryEnv = browserEnv(),
): Promise<DeliveryResult> {
  const file = new File([blob], fileName, { type: 'application/zip' });
  if (env.share && env.canShare?.({ files: [file] })) {
    try {
      await env.share({ files: [file] });
      return 'shared';
    } catch (error) {
      const name = (error as Error).name;
      if (name === 'AbortError') return 'cancelled';
      // Building the zip can outlast the tap that started it; a new tap lets the share open.
      if (name === 'NotAllowedError') return 'needsTap';
    }
  }
  env.download(file);
  return 'downloaded';
}
