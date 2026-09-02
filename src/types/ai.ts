export type AIProvider = 'simulation' | 'gemini' | 'openai';

export type ThemeMode = 'dark' | 'dim' | 'light';

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  geminiModel: string;
  openAiApiKey: string;
  openAiBaseUrl: string;
  openAiModel: string;
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
