export type NotificationType = 'reply' | 'like' | 'repost' | 'mention' | 'world_event';

export interface Notification {
  id: string;
  worldId: string;
  type: NotificationType;
  actorId: string; // Character ID who triggered it (or system)
  targetPostId?: string;
  contentPreview?: string;
  createdAt: number;
  read: boolean;
}
