// M3 adds descriptions to the lookups; for now these feed the form's autocomplete.
export interface GrapeInfo {
  aliases?: string[];
  color: 'red' | 'white';
  body: 'kevyt' | 'keskitäyteläinen' | 'täyteläinen';
  description: string;
  aromas: string[];
  foods: string[];
  servingTemp: string;
}

export interface RegionInfo {
  country: string;
  description: string;
  grapes: string[];
}

export interface Knowledge {
  grapes: Record<string, GrapeInfo>;
  regions: Record<string, RegionInfo>;
}

export const EMPTY_KNOWLEDGE: Knowledge = { grapes: {}, regions: {} };

const sortFinnish = (values: Iterable<string>) =>
  [...values].sort((a, b) => a.localeCompare(b, 'fi'));

export function grapeNames(knowledge: Knowledge): string[] {
  return sortFinnish(Object.keys(knowledge.grapes));
}

export function countryNames(knowledge: Knowledge): string[] {
  return sortFinnish(new Set(Object.values(knowledge.regions).map((region) => region.country)));
}

/** Autocomplete is a convenience, so a failed load just means no suggestions. */
export async function loadKnowledge(): Promise<Knowledge> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}knowledge.json`);
    return response.ok ? ((await response.json()) as Knowledge) : EMPTY_KNOWLEDGE;
  } catch {
    return EMPTY_KNOWLEDGE;
  }
}
