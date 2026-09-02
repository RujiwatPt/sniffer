import { describe, it, expect, beforeEach } from 'vitest';
import { usePostStore } from '../store/usePostStore';
import { useWorldStore } from '../store/useWorldStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { Post } from '../types/post';

describe('Zustand Stores', () => {
  beforeEach(() => {
    usePostStore.getState().resetToDefaults();
    useWorldStore.getState().resetToDefaults();
    useCharacterStore.getState().resetToDefaults();
  });

  it('adds a post and retrieves it by world', () => {
    const post: Post = {
      id: 'unit_test_post',
      worldId: 'world_cyberpunk',
      authorId: 'user_neo',
      content: 'Hello Neo-Veridia!',
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

    usePostStore.getState().addPost(post);

    const posts = usePostStore.getState().getPostsByWorld('world_cyberpunk');
    const found = posts.find((p) => p.id === 'unit_test_post');
    expect(found).toBeDefined();
    expect(found?.content).toBe('Hello Neo-Veridia!');
  });

  it('toggles likes correctly', () => {
    const post: Post = {
      id: 'like_test_post',
      worldId: 'world_cyberpunk',
      authorId: 'user_neo',
      content: 'Liking test',
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

    usePostStore.getState().addPost(post);

    // Toggle on
    usePostStore.getState().toggleLike('like_test_post', 'char_mira');
    let updated = usePostStore.getState().posts.find((p) => p.id === 'like_test_post');
    expect(updated?.likesCount).toBe(1);
    expect(updated?.likedBy).toContain('char_mira');

    // Toggle off
    usePostStore.getState().toggleLike('like_test_post', 'char_mira');
    updated = usePostStore.getState().posts.find((p) => p.id === 'like_test_post');
    expect(updated?.likesCount).toBe(0);
    expect(updated?.likedBy).not.toContain('char_mira');
  });

  it('builds thread tree data with ancestors and nested replies', () => {
    const rootPost: Post = {
      id: 'root_post',
      worldId: 'world_cyberpunk',
      authorId: 'user_neo',
      content: 'Root conversation topic',
      createdAt: Date.now() - 10000,
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 1,
      viewsCount: 10,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: [],
    };

    const replyPost: Post = {
      id: 'reply_post_1',
      worldId: 'world_cyberpunk',
      authorId: 'char_mira',
      content: 'Reply to root',
      createdAt: Date.now() - 5000,
      replyToId: 'root_post',
      rootPostId: 'root_post',
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      viewsCount: 5,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: [],
    };

    usePostStore.getState().addPost(rootPost);
    usePostStore.getState().addPost(replyPost);

    const threadData = usePostStore.getState().getThreadData('root_post');
    expect(threadData).toBeDefined();
    expect(threadData?.rootPost.id).toBe('root_post');
    expect(threadData?.replies.some((r) => r.id === 'reply_post_1')).toBe(true);
  });

  it('switches worlds and retrieves characters accordingly', () => {
    const worldStore = useWorldStore.getState();
    expect(worldStore.worlds.length).toBeGreaterThanOrEqual(3);

    worldStore.setActiveWorldId('world_tech');
    expect(useWorldStore.getState().getActiveWorld().id).toBe('world_tech');

    const techChars = useCharacterStore.getState().getCharactersByWorld('world_tech');
    expect(techChars.length).toBeGreaterThan(0);
  });
});
