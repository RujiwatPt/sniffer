import { SocialStats } from './socialStatus';

export interface EncounterOption {
  id: string;
  label: string;
  actionText: string; // Narrative action taken
  statChanges: Partial<SocialStats>;
  affinityChanges: Record<string, number>; // npcId -> delta
  outcomeText: string; // What happens in the world
  timelinePostText: string; // What gets broadcasted or posted
}

export interface WorldEncounter {
  id: string;
  worldId: string;
  title: string;
  setting: string;
  situation: string;
  involvedNpcIds: string[]; // 1 or 2 NPCs at most!
  options: EncounterOption[];
}
