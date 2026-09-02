export type CharacterArchetype =
  | 'shitposter'
  | 'intellectual'
  | 'agitator'
  | 'wholesome'
  | 'conspiracy_theorist'
  | 'corporate_shill'
  | 'celebrity'
  | 'mystic'
  | 'doomer'
  | 'technocrat';

export type StanceTowardsUser =
  | 'admirer'
  | 'rival'
  | 'hater'
  | 'neutral'
  | 'simp'
  | 'skeptic'
  | 'bestie';

export type VerifiedBadgeType = 'blue' | 'gold' | 'government';

export interface Character {
  id: string;
  worldId: string;
  name: string;
  handle: string; // without @, e.g. "glitch_kidx"
  avatar: string; // URL or preset avatar key
  bannerUrl?: string;
  bio: string;
  faction?: string;
  archetype: CharacterArchetype;
  speechStyle: string; // e.g. "all lowercase, sarcastic, quotes tech memes"
  personality: string; // Core personality prompt
  stanceTowardsUser: StanceTowardsUser;
  followerCount: number;
  followingCount: number;
  verified: boolean;
  verifiedType?: VerifiedBadgeType;
  isUser: boolean; // true for the player's active account
  createdAt: number;
}
