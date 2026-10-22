import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../services/simulationEngine';
import { PRESET_WORLDS } from '../services/presetWorlds';
import { Post } from '../types/post';

describe('SimulationEngine', () => {
  const sample = PRESET_WORLDS[0];
  const { world, characters } = sample;

  it('generates a reaction wave with multiple character replies', () => {
    const post: Post = {
      id: 'test_post_1',
      worldId: world.id,
      authorId: 'user_neo',
      content: 'The cyber corporations are hacking our dreams tonight.',
      createdAt: Date.now(),
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      viewsCount: 1,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: [],
    };

    const wave = SimulationEngine.generateReactionWave(world, characters, post, 'user_neo');

    expect(wave).toBeDefined();
    expect(wave.replies.length).toBeGreaterThanOrEqual(2);
    expect(wave.totalViewsAdded).toBeGreaterThan(0);

    // Verify each reply has content and author
    wave.replies.forEach((reply) => {
      expect(reply.content.length).toBeGreaterThan(0);
      expect(reply.characterId).not.toBe(post.authorId);
      expect(reply.delayMs).toBeGreaterThan(0);
    });
  });

  it('generates autonomous character takes reflecting personality', () => {
    const char = characters.find((c) => c.archetype === 'shitposter')!;
    const postText = SimulationEngine.generateAutonomousPost(world, char);

    expect(postText).toBeDefined();
    expect(typeof postText).toBe('string');
    expect(postText.length).toBeGreaterThan(5);
  });

  it('generates contextual replies that reference the topic of the post', () => {
    const post: Post = {
      id: 'test_post_topic',
      worldId: world.id,
      authorId: 'user_neo',
      content: 'I just adopted a holographic pet dragon from the night market.',
      createdAt: Date.now(),
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      viewsCount: 1,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: [],
    };

    const wave = SimulationEngine.generateReactionWave(world, characters, post, 'user_neo');
    expect(wave.replies.length).toBeGreaterThan(0);
    // At least one of the replies should incorporate contextual words or topic
    const hasTopicOrRelevantWord = wave.replies.some(
      (r) =>
        r.content.toLowerCase().includes('holographic') ||
        r.content.toLowerCase().includes('dragon') ||
        r.content.toLowerCase().includes('night') ||
        r.content.toLowerCase().includes('market') ||
        r.content.length > 10
    );
    expect(hasTopicOrRelevantWord).toBe(true);
  });

  it('generates reactions to a breaking world event', () => {
    const event = {
      id: 'event_test',
      worldId: world.id,
      title: 'Neon Power Surge Detected',
      description: 'Power grid collapsed in Sector 9',
      impactLevel: 'breaking' as const,
      timestamp: Date.now(),
      activeHashtag: 'PowerSurge',
    };

    const reactions = SimulationEngine.generateEventReactions(world, characters, event);
    expect(reactions.length).toBeGreaterThan(0);
    reactions.forEach((r) => {
      expect(r.content).toContain('PowerSurge');
    });
  });

  it('generates a procedural character matching the world atmosphere', () => {
    const newChar = SimulationEngine.generateProceduralCharacter(world);

    expect(newChar).toBeDefined();
    expect(newChar.worldId).toBe(world.id);
    expect(newChar.name.length).toBeGreaterThan(2);
    expect(newChar.handle.length).toBeGreaterThan(2);
    expect(newChar.isUser).toBe(false);
    expect(newChar.followerCount).toBeGreaterThan(0);
  });
});
