export interface SocialStats {
  aura: number;      // 0 - 100: Presence, confidence, prestige, commanding energy
  charm: number;     // 0 - 100: Charisma, warmth, persuasion, flirtatiousness
  humor: number;     // 0 - 100: Wit, comedic timing, meme mastery, irony
  ruthless: number;  // 0 - 100: Cold calculation, intimidation, unapologetic edge
  dark: number;      // 0 - 100: Mystery, cynicism, rebellion, forbidden intrigue
}

export type SocialStatKey = keyof SocialStats;

export interface SocialStatDelta {
  stat: SocialStatKey;
  delta: number;
  reason: string;
}

export interface SocialStatEvaluation {
  deltas: SocialStatDelta[];
  dominantTone: SocialStatKey | 'neutral';
  analysis: string;
}

export const STAT_METADATA: Record<
  SocialStatKey,
  {
    name: string;
    description: string;
    color: string;
    barColor: string;
    icon: string;
    highTitle: string;
  }
> = {
  aura: {
    name: 'Aura',
    description: 'Prestige, commanding confidence, and timeline gravity',
    color: 'text-amber-400',
    barColor: 'bg-amber-400',
    icon: '✨',
    highTitle: 'Untouchable Presence',
  },
  charm: {
    name: 'Charm',
    description: 'Charisma, warmth, social allure, and persuasion',
    color: 'text-pink-400',
    barColor: 'bg-pink-400',
    icon: '💖',
    highTitle: 'Master Persuader',
  },
  humor: {
    name: 'Humor',
    description: 'Wit, irony, memes, comedic timing, and roasting',
    color: 'text-yellow-400',
    barColor: 'bg-yellow-400',
    icon: '🃏',
    highTitle: 'Timeline Jester',
  },
  ruthless: {
    name: 'Ruthless',
    description: 'Cold calculation, brutality, and intimidating dominance',
    color: 'text-red-500',
    barColor: 'bg-red-500',
    icon: '⚡️',
    highTitle: 'Apex Predator',
  },
  dark: {
    name: 'Dark / Edge',
    description: 'Cynicism, rebellion, forbidden tech, and shadow lore',
    color: 'text-purple-400',
    barColor: 'bg-purple-400',
    icon: '👁️',
    highTitle: 'Shadow Operative',
  },
};
