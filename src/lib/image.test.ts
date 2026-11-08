import imageCompression from 'browser-image-compression';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWinePhotos, PHOTO_OPTIONS, THUMB_OPTIONS } from './image';

vi.mock('browser-image-compression', () => ({ default: vi.fn() }));
const compress = vi.mocked(imageCompression);

beforeEach(() => {
  compress.mockReset();
  compress.mockImplementation(async (file) => file);
});

describe('image options', () => {
  it('never uses the web worker mode, which loads code from a CDN', () => {
    expect(PHOTO_OPTIONS.useWebWorker).toBe(false);
    expect(THUMB_OPTIONS.useWebWorker).toBe(false);
  });

  it('uses the agreed sizes', () => {
    expect(PHOTO_OPTIONS.maxWidthOrHeight).toBe(1200);
    expect(THUMB_OPTIONS.maxWidthOrHeight).toBe(300);
  });
});

describe('createWinePhotos', () => {
  it('returns JPEG blobs for both the photo and the thumbnail', async () => {
    const result = await createWinePhotos(new File(['abc'], 'a.png', { type: 'image/png' }));
    expect(result.photo.type).toBe('image/jpeg');
    expect(result.thumb.type).toBe('image/jpeg');
    expect(compress).toHaveBeenCalledTimes(2);
    expect(compress.mock.calls[0][1]).toBe(PHOTO_OPTIONS);
    expect(compress.mock.calls[1][1]).toBe(THUMB_OPTIONS);
  });

  it('passes on compression failures so the caller can report them', async () => {
    compress.mockRejectedValue(new Error('bad image'));
    await expect(createWinePhotos(new File(['abc'], 'a.jpg'))).rejects.toThrow('bad image');
  });
});
