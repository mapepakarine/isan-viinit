export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'other';
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Wine {
  id?: number;
  name: string;
  producer?: string;
  type: WineType;
  grape?: string;
  country?: string;
  region?: string;
  vintage?: number;
  price?: number; // EUR
  store?: string;
  rating?: Rating;
  notes?: string;
  food?: string;
  buyAgain: boolean;
  photo?: Blob; // max 1200 px long edge, JPEG
  thumb?: Blob; // 300 px, used in lists
  sample?: boolean; // demo wine that Settings can remove in one tap
  tastedAt: string; // ISO date (YYYY-MM-DD)
  createdAt: string; // ISO datetime
  updatedAt: string;
}
