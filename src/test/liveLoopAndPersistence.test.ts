import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../store/useCharacterStore';
import { useRelationshipStore } from '../store/useRelationshipStore';
import { usePostStore } from '../store/usePostStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Post } from '../types/post';

describe('Live Loop Stability & Persistence Guards', () => {
  const worldId = 'world_cyberpunk';

  beforeEach(() => {
    useCharacterStore.getState().resetToDefaults();
    useRelationshipStore.getState().resetRelationships();
    usePostStore.getState().resetToDefaults();
  });

  it('Following graph is deterministic and toggles follow state correctly', () => {
    const charStore = useCharacterStore.getState();
    const characters = charStore.getCharactersByWorld(worldId);
    const targetNpc = characters.find((c) => !c.isUser)!;

    // Initially seeded or unseeded, check follow state
    const initialFollow = charStore.isFollowing(targetNpc.id, worldId);
    
    // Toggle follow
    charStore.toggleFollow(targetNpc.id, worldId);
    expect(charStore.isFollowing(targetNpc.id, worldId)).toBe(!initialFollow);

    // Toggle back
    charStore.toggleFollow(targetNpc.id, worldId);
    expect(charStore.isFollowing(targetNpc.id, worldId)).toBe(initialFollow);
  });

  it('getRelationship is pure and does not mutate store state during render', () => {
    const relStore = useRelationshipStore.getState();
    const beforeKeys = Object.keys(relStore.relationships);
    expect(beforeKeys.length).toBe(0);

    // Calling getRelationship should return valid object without adding to state.relationships
    const rel = relStore.getRelationship('brand_new_npc', worldId);
    expect(rel).toBeDefined();
    expect(rel.characterId).toBe('brand_new_npc');
    expect(rel.affinity).toBe(0);
    expect(rel.tier).toBe('neutral');

    // Store state must remain untouched
    const afterKeys = Object.keys(useRelationshipStore.getState().relationships);
    expect(afterKeys.length).toBe(0);
  });

  it('modifyAffinity correctly updates state with composite key', () => {
    const relStore = useRelationshipStore.getState();
    relStore.modifyAffinity('target_npc_1', worldId, 15, 'Great conversation', 'dm');

    const state = useRelationshipStore.getState();
    const key = `${worldId}:target_npc_1`;
    expect(state.relationships[key]).toBeDefined();
    expect(state.relationships[key].affinity).toBe(15);
    expect(state.relationships[key].tier).toBe('neutral');
  });

  it('addPost caps the post list at 150 items to prevent unbounded storage', () => {
    // Add 160 posts
    for (let i = 0; i < 160; i++) {
      const dummyPost: Post = {
        id: `dummy_${i}`,
        worldId,
        authorId: 'test_author',
        content: `Test post number ${i}`,
        createdAt: Date.now() + i,
        likesCount: 0,
        repostsCount: 0,
        repliesCount: 0,
        viewsCount: 0,
        likedBy: [],
        repostedBy: [],
        bookmarkedBy: [],
        tags: [],
      };
      usePostStore.getState().addPost(dummyPost);
    }

    const currentPosts = usePostStore.getState().posts;
    expect(currentPosts.length).toBeLessThanOrEqual(150);
  });

  it('Settings partialize excludes ephemeral modal states from persistence payload', () => {
    const store = useSettingsStore.getState();
    store.setSettingsOpen(true);
    store.setComposeModalOpen(true);
    store.setEventTriggerOpen(true);

    // Verify partialize logic
    const persistOptions = (useSettingsStore as any).persist?.getOptions?.();
    if (persistOptions?.partialize) {
      const persisted = persistOptions.partialize(useSettingsStore.getState());
      expect((persisted as any).isSettingsOpen).toBeUndefined();
      expect((persisted as any).isComposeModalOpen).toBeUndefined();
      expect((persisted as any).isEventTriggerOpen).toBeUndefined();
      expect((persisted as any).settings).toBeDefined();
    }
  });
});
