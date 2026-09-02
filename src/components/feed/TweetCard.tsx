import React from 'react';
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
  Trash2,
} from 'lucide-react';
import { Post } from '../../types/post';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useWorldStore } from '../../store/useWorldStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface TweetCardProps {
  post: Post;
  showReplyLine?: boolean;
  onOpenThread?: (post: Post) => void;
  isMainThreadView?: boolean;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  post,
  showReplyLine = false,
  onOpenThread,
  isMainThreadView = false,
}) => {
  const { getCharacterById, getActiveUserCharacter } = useCharacterStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { toggleLike, toggleRepost, toggleBookmark, deletePost, incrementViews } =
    usePostStore();

  const author = getCharacterById(post.authorId) || {
    id: post.authorId,
    name: 'Unknown Resident',
    handle: 'unknown',
    avatar: '',
    bio: '',
    archetype: 'intellectual' as const,
    speechStyle: '',
    personality: '',
    stanceTowardsUser: 'neutral' as const,
    followerCount: 0,
    followingCount: 0,
    verified: false,
    isUser: false,
    worldId: post.worldId,
    createdAt: Date.now(),
  };

  const isLiked = post.likedBy.includes(activeUser.id);
  const isReposted = post.repostedBy.includes(activeUser.id);
  const isBookmarked = post.bookmarkedBy.includes(activeUser.id);

  const formatTimestamp = (ts: number) => {
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const handleCardClick = () => {
    incrementViews(post.id, 1);
    if (onOpenThread) {
      onOpenThread(post);
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Render text with highlighted mentions and tags
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-twitter-blue hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-twitter-blue hover:underline cursor-pointer font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const stanceColors: Record<string, string> = {
    admirer: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    bestie: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    rival: 'text-amber-400 bg-amber-950/60 border-amber-800',
    hater: 'text-rose-400 bg-rose-950/60 border-rose-800',
    simp: 'text-pink-400 bg-pink-950/60 border-pink-800',
    skeptic: 'text-purple-400 bg-purple-950/60 border-purple-800',
  };

  return (
    <article
      onClick={handleCardClick}
      className={`relative px-4 pt-3 pb-2 transition-colors cursor-pointer border-b border-[#2f3336] ${
        isMainThreadView ? 'bg-transparent' : 'hover:bg-[#080808]'
      }`}
    >
      <div className="flex space-x-3">
        {/* Left Column: Avatar & Thread Line */}
        <div className="flex flex-col items-center shrink-0">
          <Avatar src={author.avatar} name={author.name} size="md" />
          {showReplyLine && (
            <div className="w-0.5 grow bg-[#333639] my-1 rounded-full" />
          )}
        </div>

        {/* Right Column: Tweet Content & Actions */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-bold text-sm text-[#e7e9ea] truncate hover:underline">
                {author.name}
              </span>
              {author.verified && (
                <VerifiedBadge type={author.verifiedType} size={15} />
              )}
              <span className="text-xs text-[#71767b] truncate">
                @{author.handle}
              </span>
              <span className="text-[#71767b] text-xs">·</span>
              <time className="text-xs text-[#71767b] shrink-0">
                {formatTimestamp(post.createdAt)}
              </time>

              {/* Character Stance Pill if not player */}
              {!author.isUser && author.stanceTowardsUser && (
                <span
                  className={`hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded border font-mono uppercase tracking-wider ml-1 ${
                    stanceColors[author.stanceTowardsUser] || 'text-[#71767b] border-[#2f3336]'
                  }`}
                  title={`Character stance towards you: ${author.stanceTowardsUser}`}
                >
                  {author.stanceTowardsUser}
                </span>
              )}
            </div>

            {/* Menu Options */}
            <div className="flex items-center">
              {post.authorId === activeUser.id && (
                <button
                  onClick={(e) => handleAction(e, () => deletePost(post.id))}
                  className="p-1.5 text-[#71767b] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Post Text */}
          <div className={`mt-1 text-[#e7e9ea] text-[15px] leading-normal break-words ${isMainThreadView ? 'text-lg' : ''}`}>
            {renderFormattedContent(post.content)}
          </div>

          {/* Attached Media Image (if any) */}
          {post.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] max-h-96">
              <img
                src={post.mediaUrl}
                alt="Post attachment"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between text-[#71767b] mt-3 max-w-md text-xs select-none">
            {/* Replies */}
            <button
              onClick={(e) => handleAction(e, () => onOpenThread?.(post))}
              className="flex items-center space-x-1.5 hover:text-twitter-blue transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>{post.repliesCount > 0 ? post.repliesCount : ''}</span>
            </button>

            {/* Reposts */}
            <button
              onClick={(e) => handleAction(e, () => toggleRepost(post.id, activeUser.id))}
              className={`flex items-center space-x-1.5 hover:text-twitter-green transition-colors group ${
                isReposted ? 'text-twitter-green' : ''
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-green/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span>{post.repostsCount > 0 ? post.repostsCount : ''}</span>
            </button>

            {/* Likes */}
            <button
              onClick={(e) => handleAction(e, () => toggleLike(post.id, activeUser.id))}
              className={`flex items-center space-x-1.5 hover:text-twitter-pink transition-colors group ${
                isLiked ? 'text-twitter-pink' : ''
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-pink/10 transition-colors">
                <Heart
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isLiked ? 'fill-current' : ''
                  }`}
                />
              </div>
              <span>{post.likesCount > 0 ? post.likesCount : ''}</span>
            </button>

            {/* Views */}
            <div className="flex items-center space-x-1.5 hover:text-twitter-blue transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10 transition-colors">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span>{post.viewsCount > 0 ? post.viewsCount.toLocaleString() : '1'}</span>
            </div>

            {/* Bookmark & Share */}
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => handleAction(e, () => toggleBookmark(post.id, activeUser.id))}
                className={`p-2 rounded-full hover:text-twitter-blue hover:bg-twitter-blue/10 transition-colors ${
                  isBookmarked ? 'text-twitter-blue fill-current' : ''
                }`}
                title="Bookmark"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="p-2 rounded-full hover:text-twitter-blue hover:bg-twitter-blue/10 transition-colors"
                title="Copy Link"
              >
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
