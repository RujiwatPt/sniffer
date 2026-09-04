export type MemoryCategory = 'user_post' | 'user_dm' | 'encounter' | 'world_event';

export interface WorldMemoryEntry {
  id: string;
  worldId: string;
  timestamp: number;
  category: MemoryCategory;
  summary: string;
  fullContent?: string;
  actorName: string;
  actorHandle: string;
  socialImpact?: string;
  involvedNpcIds?: string[];
  tags?: string[];
}
