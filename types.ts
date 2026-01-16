
export interface ChallengeImage {
  id: string;
  url: string;
  day: number;
}

export interface ChallengeConfig {
  title: string;
  totalDays: 30 | 31;
  titleFont: 'serif' | 'script' | 'sans';
  themeColor: string;
  year: string;
  month: string;
  startOffset: number; // Number of empty spaces at the beginning
  columns: number;     // Number of columns in the grid
  skippedDays: number[]; // Days explicitly marked as blank/empty
}
