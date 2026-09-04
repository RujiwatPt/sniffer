import { describe, it, expect, beforeEach } from 'vitest';
import { useWorldMemoryStore } from '../store/useWorldMemoryStore';

describe('World Memory System', () => {
  const worldId = 'world_cyberpunk';

  beforeEach(() => {
    useWorldMemoryStore.getState().clearMemories(worldId);
  });

  it('records user posts, DMs, and encounters into world memory', () => {
    const store = useWorldMemoryStore.getState();

    store.addMemory({
      worldId,
      category: 'user_post',
      summary: 'Exposed sector 4 security flaw',
      actorName: 'Player',
      actorHandle: 'player_one',
      socialImpact: 'Aura +4',
    });

    store.addMemory({
      worldId,
      category: 'user_dm',
      summary: 'Agreed to help Kira decrypt datapad',
      actorName: 'Player',
      actorHandle: 'player_one',
      socialImpact: 'Friendly with Kira',
      involvedNpcIds: ['kira_hex'],
    });

    const memories = store.getMemories(worldId);
    expect(memories).toHaveLength(2);
    expect(memories[0].category).toBe('user_dm');
    expect(memories[1].category).toBe('user_post');
  });

  it('filters memories by category', () => {
    const store = useWorldMemoryStore.getState();

    store.addMemory({
      worldId,
      category: 'encounter',
      summary: 'Arbitrated dispute between two deckers',
      actorName: 'Player',
      actorHandle: 'player_one',
    });

    const encounterMemories = store.getMemoriesByCategory(worldId, 'encounter');
    expect(encounterMemories).toHaveLength(1);
    expect(encounterMemories[0].summary).toContain('Arbitrated dispute');

    const dmMemories = store.getMemoriesByCategory(worldId, 'user_dm');
    expect(dmMemories).toHaveLength(0);
  });
});
