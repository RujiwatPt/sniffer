import { StanceTowardsUser } from './character';

export type RelationshipTier =
  | 'nemesis'      // -100 to -70
  | 'hostile'      // -69 to -30
  | 'skeptical'    // -29 to -10
  | 'neutral'      // -9 to 19
  | 'friendly'     // 20 to 49
  | 'close_friend' // 50 to 74
  | 'admirer'      // 75 to 89
  | 'soulmate';    // 90 to 100

export interface RelationshipLog {
  id: string;
  timestamp: number;
  delta: number;
  reason: string;
  source: 'tweet_like' | 'tweet_repost' | 'tweet_reply' | 'dm' | 'event' | 'day_cycle' | 'post';
}

export interface CharacterRelationship {
  characterId: string;
  worldId: string;
  affinity: number; // Clamped to [-100, 100]
  tier: RelationshipTier;
  interactionsCount: number;
  lastInteractedAt: number;
  durableFacts: string[]; // Memories & facts learned about the user
  history: RelationshipLog[];
}

export function getRelationshipTier(affinity: number): RelationshipTier {
  if (affinity <= -70) return 'nemesis';
  if (affinity <= -30) return 'hostile';
  if (affinity <= -10) return 'skeptical';
  if (affinity < 20) return 'neutral';
  if (affinity < 50) return 'friendly';
  if (affinity < 75) return 'close_friend';
  if (affinity < 90) return 'admirer';
  return 'soulmate';
}

export function mapTierToStance(tier: RelationshipTier): StanceTowardsUser {
  switch (tier) {
    case 'nemesis':
    case 'hostile':
      return 'hater';
    case 'skeptical':
      return 'skeptic';
    case 'neutral':
      return 'neutral';
    case 'friendly':
      return 'bestie';
    case 'close_friend':
      return 'admirer';
    case 'admirer':
      return 'simp';
    case 'soulmate':
      return 'admirer';
  }
}

export const TIER_CONFIG: Record<
  RelationshipTier,
  {
    label: string;
    description: string;
    badgeColor: string;
    textColor: string;
    borderColor: string;
    heartColor: string;
  }
> = {
  nemesis: {
    label: 'Nemesis',
    description: 'Sworn enemy, seeks your downfall',
    badgeColor: 'bg-red-950/70',
    textColor: 'text-red-400',
    borderColor: 'border-red-800/80',
    heartColor: 'text-red-600',
  },
  hostile: {
    label: 'Hostile',
    description: 'Antagonistic, leaves negative replies',
    badgeColor: 'bg-rose-950/70',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-800/70',
    heartColor: 'text-rose-500',
  },
  skeptical: {
    label: 'Skeptical',
    description: 'Doubtful, questions your takes',
    badgeColor: 'bg-amber-950/60',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-800/60',
    heartColor: 'text-amber-500',
  },
  neutral: {
    label: 'Neutral',
    description: 'Timeline acquaintance',
    badgeColor: 'bg-neutral-900',
    textColor: 'text-[#71767b]',
    borderColor: 'border-[#2f3336]',
    heartColor: 'text-neutral-500',
  },
  friendly: {
    label: 'Friendly',
    description: 'Enjoys your presence, likes your posts',
    badgeColor: 'bg-emerald-950/60',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-800/60',
    heartColor: 'text-emerald-500',
  },
  close_friend: {
    label: 'Close Friend',
    description: 'Trusted confidant, frequents your DMs',
    badgeColor: 'bg-teal-950/60',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-800/70',
    heartColor: 'text-teal-400',
  },
  admirer: {
    label: 'Admirer',
    description: 'Enthusiastic supporter, hypes you up',
    badgeColor: 'bg-purple-950/60',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-800/70',
    heartColor: 'text-purple-400',
  },
  soulmate: {
    label: 'Devoted',
    description: 'Deep bond, shares vulnerabilities & secrets',
    badgeColor: 'bg-pink-950/70',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-800/80',
    heartColor: 'text-pink-500',
  },
};
