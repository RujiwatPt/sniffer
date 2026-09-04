import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post, ThreadViewData } from '../types/post';
import { PRESET_WORLDS } from '../services/presetWorlds';
import { useRelationshipStore } from './useRelationshipStore';

export type FeedFilterTab = 'for_you' | 'following' | 'pulse';

interface PostState {
  posts: Post[];
  activeFilterTab: FeedFilterTab;
  selectedThreadPostId: string | null;
  typingCharacterIds: string[]; // for real-time live typing indicators

  setActiveFilterTab: (tab: FeedFilterTab) => void;
  setSelectedThreadPostId: (id: string | null) => void;
  addPost: (post: Post) => void;
  deletePost: (id: string) => void;

  toggleLike: (postId: string, characterId: string) => void;
  toggleRepost: (postId: string, characterId: string) => void;
  toggleBookmark: (postId: string, characterId: string) => void;
  incrementViews: (postId: string, count?: number) => void;

  addTypingCharacter: (characterId: string) => void;
  removeTypingCharacter: (characterId: string) => void;

  getPostsByWorld: (worldId: string) => Post[];
  getThreadData: (postId: string) => ThreadViewData | null;
  resetToDefaults: () => void;
}

const defaultStarterPosts = PRESET_WORLDS.flatMap((p) => p.starterPosts);

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: defaultStarterPosts,
      activeFilterTab: 'for_you',
      selectedThreadPostId: null,
      typingCharacterIds: [],

      setActiveFilterTab: (tab: FeedFilterTab) => {
        set({ activeFilterTab: tab });
      },

      setSelectedThreadPostId: (id: string | null) => {
        set({ selectedThreadPostId: id });
      },

      addPost: (newPost: Post) => {
        set((state) => {
          // If this post is a reply, update the reply counter on the parent post
          const parentPost = newPost.replyToId ? state.posts.find((p) => p.id === newPost.replyToId) : undefined;
          if (parentPost && parentPost.authorId !== newPost.authorId) {
            try {
              useRelationshipStore
                .getState()
                .modifyAffinity(parentPost.authorId, newPost.worldId, 3, 'Replied to their post', 'tweet_reply');
            } catch {
              // ignore
            }
          }

          const updatedPosts = state.posts.map((p) => {
            if (newPost.replyToId && p.id === newPost.replyToId) {
              return { ...p, repliesCount: p.repliesCount + 1 };
            }
            return p;
          });

          return {
            posts: [newPost, ...updatedPosts].slice(0, 150),
          };
        });
      },

      deletePost: (id: string) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id && p.replyToId !== id),
        }));
      },

      toggleLike: (postId: string, characterId: string) => {
        set((state) => {
          const targetPost = state.posts.find((p) => p.id === postId);
          const alreadyLiked = targetPost?.likedBy.includes(characterId);

          if (targetPost && !alreadyLiked && targetPost.authorId !== characterId) {
            try {
              useRelationshipStore
                .getState()
                .modifyAffinity(targetPost.authorId, targetPost.worldId, 1, 'Liked their post', 'tweet_like');
            } catch {
              // ignore
            }
          }

          return {
            posts: state.posts.map((p) => {
              if (p.id !== postId) return p;
              const isLiked = p.likedBy.includes(characterId);
              const likedBy = isLiked
                ? p.likedBy.filter((id) => id !== characterId)
                : [...p.likedBy, characterId];
              const likesCount = Math.max(0, p.likesCount + (isLiked ? -1 : 1));
              return { ...p, likedBy, likesCount };
            }),
          };
        });
      },

      toggleRepost: (postId: string, characterId: string) => {
        set((state) => {
          const targetPost = state.posts.find((p) => p.id === postId);
          const alreadyReposted = targetPost?.repostedBy.includes(characterId);

          if (targetPost && !alreadyReposted && targetPost.authorId !== characterId) {
            try {
              useRelationshipStore
                .getState()
                .modifyAffinity(targetPost.authorId, targetPost.worldId, 2, 'Reposted their post', 'tweet_repost');
            } catch {
              // ignore
            }
          }

          return {
            posts: state.posts.map((p) => {
              if (p.id !== postId) return p;
              const isReposted = p.repostedBy.includes(characterId);
              const repostedBy = isReposted
                ? p.repostedBy.filter((id) => id !== characterId)
                : [...p.repostedBy, characterId];
              const repostsCount = Math.max(0, p.repostsCount + (isReposted ? -1 : 1));
              return { ...p, repostedBy, repostsCount };
            }),
          };
        });
      },

      toggleBookmark: (postId: string, characterId: string) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            const alreadyBookmarked = p.bookmarkedBy.includes(characterId);
            const bookmarkedBy = alreadyBookmarked
              ? p.bookmarkedBy.filter((id) => id !== characterId)
              : [...p.bookmarkedBy, characterId];
            return { ...p, bookmarkedBy };
          }),
        }));
      },

      incrementViews: (postId: string, count = 1) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? { ...p, viewsCount: p.viewsCount + count } : p)),
        }));
      },

      addTypingCharacter: (characterId: string) => {
        set((state) => ({
          typingCharacterIds: Array.from(new Set([...state.typingCharacterIds, characterId])),
        }));
      },

      removeTypingCharacter: (characterId: string) => {
        set((state) => ({
          typingCharacterIds: state.typingCharacterIds.filter((id) => id !== characterId),
        }));
      },

      getPostsByWorld: (worldId: string) => {
        return get().posts.filter((p) => p.worldId === worldId);
      },

      getThreadData: (postId: string): ThreadViewData | null => {
        const { posts } = get();
        const current = posts.find((p) => p.id === postId);
        if (!current) return null;

        // Traverse upwards to find ancestors
        const ancestors: Post[] = [];
        let currAncestorId = current.replyToId;
        const visited = new Set<string>();

        while (currAncestorId && !visited.has(currAncestorId)) {
          visited.add(currAncestorId);
          const ancestor = posts.find((p) => p.id === currAncestorId);
          if (ancestor) {
            ancestors.unshift(ancestor);
            currAncestorId = ancestor.replyToId;
          } else {
            break;
          }
        }

        // Gather all direct and nested replies
        const replies = posts
          .filter((p) => p.replyToId === postId || p.rootPostId === postId)
          .sort((a, b) => a.createdAt - b.createdAt);

        return {
          rootPost: current,
          ancestors,
          replies,
        };
      },

      resetToDefaults: () => {
        set({
          posts: defaultStarterPosts,
          activeFilterTab: 'for_you',
          selectedThreadPostId: null,
          typingCharacterIds: [],
        });
      },
    }),
    {
      name: 'sniffer_post_store_v1',
    }
  )
);
