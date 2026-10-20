import { describe, it, expect, beforeEach } from 'vitest';
import { useDMStore } from '../store/useDMStore';
import { SimulationEngine } from '../services/simulationEngine';
import { Character } from '../types/character';
import { CharacterRelationship } from '../types/relationship';

describe('Direct Messages System', () => {
  beforeEach(() => {
    useDMStore.getState().resetDMs();
  });

  const mockUser: Character = {
    id: 'user_1',
    worldId: 'world_cyberpunk',
    name: 'Player One',
    handle: 'player_one',
    avatar: '',
    bio: '',
    archetype: 'intellectual',
    speechStyle: 'casual',
    personality: '',
    stanceTowardsUser: 'bestie',
    followerCount: 10,
    followingCount: 10,
    verified: false,
    isUser: true,
    createdAt: Date.now(),
  };

  const mockNPC: Character = {
    id: 'npc_1',
    worldId: 'world_cyberpunk',
    name: 'Kira Hex',
    handle: 'kira_hex',
    avatar: '',
    bio: '',
    archetype: 'shitposter',
    speechStyle: 'all lowercase, witty internet slang',
    personality: 'Decker who loves trolling and hacking megacorps',
    stanceTowardsUser: 'neutral',
    followerCount: 1000,
    followingCount: 200,
    verified: true,
    isUser: false,
    createdAt: Date.now(),
  };

  it('creates and manages DM threads', () => {
    const store = useDMStore.getState();

    const thread = store.getOrCreateThread('world_cyberpunk', mockUser.id, mockNPC.id);
    expect(thread).toBeDefined();
    expect(thread.participantIds).toContain(mockUser.id);
    expect(thread.participantIds).toContain(mockNPC.id);

    // Fetching again returns existing thread
    const sameThread = store.getOrCreateThread('world_cyberpunk', mockUser.id, mockNPC.id);
    expect(sameThread.id).toBe(thread.id);
  });

  it('records sent and received direct messages and updates unread counts', () => {
    const store = useDMStore.getState();
    const thread = store.getOrCreateThread('world_cyberpunk', mockUser.id, mockNPC.id);

    // User sends message
    const userMsg = store.sendMessage(
      thread.id,
      mockUser.id,
      mockNPC.id,
      'Hey Kira, got a minute?'
    );
    expect(userMsg.content).toBe('Hey Kira, got a minute?');

    const messages = store.getThreadMessages(thread.id);
    expect(messages).toHaveLength(1);

    // NPC receives message while thread is inactive
    store.receiveMessage(
      thread.id,
      mockNPC.id,
      mockUser.id,
      'depends, are you paying in creds?'
    );

    const updatedThread = store.getThreadById(thread.id);
    expect(updatedThread?.unreadCount).toBe(1);

    // Marking thread read
    store.markThreadRead(thread.id);
    expect(store.getThreadById(thread.id)?.unreadCount).toBe(0);
  });

  it('generates procedural DM replies matching relationship tier', () => {
    const hostileRel: CharacterRelationship = {
      characterId: mockNPC.id,
      worldId: 'world_cyberpunk',
      affinity: -60,
      tier: 'hostile',
      interactionsCount: 1,
      lastInteractedAt: Date.now(),
      durableFacts: [],
      history: [],
    };

    const hostileReply = SimulationEngine.generateProceduralDMReply(
      mockNPC,
      mockUser,
      hostileRel,
      'Can you help me?',
      'afternoon'
    );
    expect(typeof hostileReply).toBe('string');
    expect(hostileReply.length).toBeGreaterThan(0);

    const closeFriendRel: CharacterRelationship = {
      ...hostileRel,
      affinity: 65,
      tier: 'close_friend',
    };

    const friendlyReply = SimulationEngine.generateProceduralDMReply(
      mockNPC,
      mockUser,
      closeFriendRel,
      'Hey, how are you?',
      'night'
    );
    expect(typeof friendlyReply).toBe('string');
    expect(friendlyReply.length).toBeGreaterThan(0);
  });

  it('caps messages per thread at 100 to prevent unbounded storage', () => {
    const store = useDMStore.getState();
    const thread = store.getOrCreateThread('world_cyberpunk', mockUser.id, mockNPC.id);

    // Send 110 messages
    for (let i = 0; i < 110; i++) {
      store.sendMessage(thread.id, mockUser.id, mockNPC.id, `Message ${i}`);
    }

    const messages = store.getThreadMessages(thread.id);
    expect(messages.length).toBe(100);
    expect(messages[0].content).toBe('Message 10');
    expect(messages[99].content).toBe('Message 109');
  });
});
