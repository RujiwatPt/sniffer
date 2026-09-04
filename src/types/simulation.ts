export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type CharacterMood =
  | 'ecstatic'
  | 'optimistic'
  | 'neutral'
  | 'annoyed'
  | 'melancholy'
  | 'chaotic'
  | 'tired';

export interface DailyGazette {
  dayNumber: number;
  headline: string;
  summary: string;
  breakingEvent?: string;
  trendingTopic?: string;
  notableGossip?: string;
}

export interface DayProgressionState {
  dayNumber: number;
  timeOfDay: TimeOfDay;
  isAdvancing: boolean;
  gazetteHistory: DailyGazette[];
  currentGazette: DailyGazette | null;
}
