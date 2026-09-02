export type WorldAtmosphere = 
  | 'cyberpunk'
  | 'fantasy'
  | 'tech_dystopia'
  | 'corporate'
  | 'sci_fi'
  | 'chaotic_internet'
  | 'custom';

export interface TrendingTopic {
  tag: string;
  postCount: number;
  category: string;
  description?: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  stance: string;
}

export interface WorldEvent {
  id: string;
  worldId: string;
  title: string;
  description: string;
  impactLevel: 'breaking' | 'high' | 'medium';
  timestamp: number;
  activeHashtag: string;
}

export interface World {
  id: string;
  name: string;
  handle: string; // e.g. "neo_veridia"
  tagline: string;
  description: string;
  atmosphere: WorldAtmosphere;
  themeAccent: string; // HEX color e.g. #1d9bf0, #00ba7c, #ff0055
  trendingTopics: TrendingTopic[];
  factions: Faction[];
  systemPrompt: string;
  createdAt: number;
}
