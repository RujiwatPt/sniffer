export interface Post {
  id: string;
  worldId: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  createdAt: number;
  replyToId?: string; // immediate parent post ID
  rootPostId?: string; // root thread post ID
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  viewsCount: number;
  likedBy: string[]; // Character/User IDs
  repostedBy: string[];
  bookmarkedBy: string[];
  tags: string[];
  isGeneratingReplies?: boolean;
}

export interface ThreadViewData {
  rootPost: Post;
  ancestors: Post[];
  replies: Post[];
}
