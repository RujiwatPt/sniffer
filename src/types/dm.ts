export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: number;
  read: boolean;
  actionNote?: string; // Optional roleplay action note e.g. "*sends attachment*"
}

export interface DMThread {
  id: string;
  worldId: string;
  participantIds: [string, string]; // [userCharacterId, npcCharacterId]
  lastMessage?: DirectMessage;
  unreadCount: number;
  isTyping: boolean;
  updatedAt: number;
}
