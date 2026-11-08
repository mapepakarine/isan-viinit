/** Tap-to-fill choices: the user's own most used values, then the defaults. */
export function suggestValues(
  used: (string | undefined)[],
  defaults: string[],
  limit: number,
): string[] {
  const counts = new Map<string, { value: string; count: number }>();
  for (const raw of used) {
    const value = raw?.trim();
    if (!value) continue;
    const entry = counts.get(value.toLowerCase()) ?? { value, count: 0 };
    entry.count += 1;
    counts.set(value.toLowerCase(), entry);
  }

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count).map((e) => e.value);
  const seen = new Set(ranked.map((value) => value.toLowerCase()));
  const extras = defaults.filter((value) => !seen.has(value.toLowerCase()));
  return [...ranked, ...extras].slice(0, limit);
}
