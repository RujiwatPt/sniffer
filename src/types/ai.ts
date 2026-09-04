export type AIProvider = 'simulation' | 'openrouter';

export type ThemeMode = 'dark' | 'dim' | 'light';

export interface OpenRouterModelOption {
  id: string;
  name: string;
  tag: string;
  speed: 'Fast' | 'Standard';
  description: string;
}

export const OPENROUTER_PRESET_MODELS: OpenRouterModelOption[] = [
  {
    id: 'sao10k/l3.3-euryale-70b',
    name: 'Sao10K: Euryale 70B',
    tag: 'Default Roleplay',
    speed: 'Standard',
    description: 'Rich, immersive prose & deep character adherence.',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    tag: 'Fast & Smart',
    speed: 'Fast',
    description: 'High intelligence, responsive dialogue and quick banter.',
  },
  {
    id: 'nousresearch/hermes-4-70b',
    name: 'Nous: Hermes 4 70B',
    tag: 'Reasoning & RP',
    speed: 'Standard',
    description: 'Advanced reasoning and creative dialogue dynamics.',
  },
  {
    id: 'aion-labs/aion-3.0-mini',
    name: 'AionLabs: Aion 3.0 Mini',
    tag: 'Fast RP',
    speed: 'Fast',
    description: 'Lightweight, rapid response roleplay model.',
  },
  {
    id: 'anthracite-org/magnum-v4-72b',
    name: 'Anthracite: Magnum v4 72B',
    tag: 'Deep Creative',
    speed: 'Standard',
    description: 'High-capability creative writing and nuance.',
  },
  {
    id: 'gryphe/mythomax-l2-13b',
    name: 'MythoMax 13B',
    tag: 'Classic Light',
    speed: 'Fast',
    description: 'Classic lightweight roleplay model with rapid generation.',
  },
  {
    id: 'thedrummer/unslopnemo-12b',
    name: 'TheDrummer: UnslopNemo 12B',
    tag: 'Anti-Cliché',
    speed: 'Fast',
    description: 'Trained to avoid repetitive tropes and cliché AI phrasing.',
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition',
    name: 'Dolphin Mistral 24B',
    tag: 'Venice Uncensored',
    speed: 'Fast',
    description: 'Venice edition uncensored storytelling model.',
  },
];

export interface AISettings {
  provider: AIProvider;
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterSiteUrl: string;
  simulationSpeed: 'fast' | 'normal' | 'cinematic';
  autonomousFeed: boolean;
  autonomousIntervalSeconds: number;
  themeMode: ThemeMode;
  accentColor: string;
}

export interface GeneratedReply {
  characterId: string;
  content: string;
  replyToPostId: string;
  delayMs: number;
  likesParent?: boolean;
  repostsParent?: boolean;
}

export interface GeneratedWave {
  replies: GeneratedReply[];
  totalViewsAdded: number;
}
