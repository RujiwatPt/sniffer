import { describe, it, expect, beforeEach } from 'vitest';
import { getRelationshipTier, mapTierToStance } from '../types/relationship';
import { useRelationshipStore } from '../store/useRelationshipStore';

describe('Relationship System', () => {
  beforeEach(() => {
    useRelationshipStore.getState().resetRelationships();
  });

  it('correctly maps numerical affinity scores to relationship tiers', () => {
    expect(getRelationshipTier(-100)).toBe('nemesis');
    expect(getRelationshipTier(-70)).toBe('nemesis');
    expect(getRelationshipTier(-69)).toBe('hostile');
    expect(getRelationshipTier(-30)).toBe('hostile');
    expect(getRelationshipTier(-29)).toBe('skeptical');
    expect(getRelationshipTier(-10)).toBe('skeptical');
    expect(getRelationshipTier(-9)).toBe('neutral');
    expect(getRelationshipTier(0)).toBe('neutral');
    expect(getRelationshipTier(19)).toBe('neutral');
    expect(getRelationshipTier(20)).toBe('friendly');
    expect(getRelationshipTier(49)).toBe('friendly');
    expect(getRelationshipTier(50)).toBe('close_friend');
    expect(getRelationshipTier(74)).toBe('close_friend');
    expect(getRelationshipTier(75)).toBe('admirer');
    expect(getRelationshipTier(89)).toBe('admirer');
    expect(getRelationshipTier(90)).toBe('soulmate');
    expect(getRelationshipTier(100)).toBe('soulmate');
  });

  it('maps tiers to appropriate character stances', () => {
    expect(mapTierToStance('nemesis')).toBe('hater');
    expect(mapTierToStance('hostile')).toBe('hater');
    expect(mapTierToStance('skeptical')).toBe('skeptic');
    expect(mapTierToStance('neutral')).toBe('neutral');
    expect(mapTierToStance('friendly')).toBe('bestie');
    expect(mapTierToStance('close_friend')).toBe('admirer');
    expect(mapTierToStance('admirer')).toBe('simp');
    expect(mapTierToStance('soulmate')).toBe('admirer');
  });

  it('modifies affinity and clamps within [-100, 100]', () => {
    const store = useRelationshipStore.getState();
    const charId = 'test_char_1';
    const worldId = 'world_cyberpunk';

    // Initial neutral relationship
    const initial = store.getRelationship(charId, worldId);
    expect(initial.affinity).toBe(0);
    expect(initial.tier).toBe('neutral');

    // Increase affinity
    const updated = store.modifyAffinity(charId, worldId, 25, 'Sent friendly DM', 'dm');
    expect(updated.affinity).toBe(25);
    expect(updated.tier).toBe('friendly');
    expect(updated.interactionsCount).toBe(1);
    expect(updated.history.length).toBe(2);

    // Over-increase to test clamping
    const maxed = store.modifyAffinity(charId, worldId, 150, 'Huge alliance', 'event');
    expect(maxed.affinity).toBe(100);
    expect(maxed.tier).toBe('soulmate');

    // Decrease down to nemesis
    const ruined = store.modifyAffinity(charId, worldId, -200, 'Betrayal', 'event');
    expect(ruined.affinity).toBe(-100);
    expect(ruined.tier).toBe('nemesis');
  });

  it('records durable facts and memories', () => {
    const store = useRelationshipStore.getState();
    const charId = 'test_char_mem';
    const worldId = 'world_cyberpunk';

    store.getRelationship(charId, worldId);
    store.addDurableFact(charId, 'User prefers dark roast coffee');
    store.addDurableFact(charId, 'User is a rogue netrunner from sector 4');

    const rel = store.getRelationship(charId, worldId);
    expect(rel.durableFacts).toHaveLength(2);
    expect(rel.durableFacts).toContain('User prefers dark roast coffee');
  });
});
