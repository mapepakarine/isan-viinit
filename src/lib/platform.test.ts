import { describe, expect, it } from 'vitest';
import { isStandalone } from './platform';

describe('isStandalone', () => {
  const env = (displayStandalone: boolean, iosStandalone?: boolean) => ({
    matchMedia: () => ({ matches: displayStandalone }),
    navigator: { standalone: iosStandalone },
  });

  it('detects an installed app on Android and iPhone', () => {
    expect(isStandalone(env(true))).toBe(true);
    expect(isStandalone(env(false, true))).toBe(true);
  });

  it('detects a normal browser tab', () => {
    expect(isStandalone(env(false))).toBe(false);
    expect(isStandalone(env(false, false))).toBe(false);
  });
});
