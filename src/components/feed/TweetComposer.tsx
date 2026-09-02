import React, { useState } from 'react';
import { Image, Smile, Globe, Sparkles } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AIService } from '../../services/aiService';
import { Avatar } from '../common/Avatar';
import { Post } from '../../types/post';

interface TweetComposerProps {
  replyToPost?: Post;
  onPostSuccess?: () => void;
  placeholder?: string;
  isModal?: boolean;
}

export const TweetComposer: React.FC<TweetComposerProps> = ({
  replyToPost,
  onPostSuccess,
  placeholder,
  isModal = false,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getActiveUserCharacter, getCharactersByWorld } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);
  const characters = getCharactersByWorld(activeWorld.id);

  const {
    addPost,
    incrementViews,
    toggleLike,
    toggleRepost,
    addTypingCharacter,
    removeTypingCharacter,
  } = usePostStore();

  const { addNotification } = useNotificationStore();
  const { settings } = useSettingsStore();

  const maxChars = 280;
  const charsRemaining = maxChars - content.length;
  const progressPercent = Math.min(100, (content.length / maxChars) * 100);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const postId = `post_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const rootPostId = replyToPost
      ? replyToPost.rootPostId || replyToPost.id
      : undefined;

    const newPost: Post = {
      id: postId,
      worldId: activeWorld.id,
      authorId: activeUser.id,
      content: content.trim(),
      mediaUrl: mediaUrl.trim() || undefined,
      createdAt: Date.now(),
      replyToId: replyToPost?.id,
      rootPostId,
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      viewsCount: 1,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: [],
    };

    // 1. Immediately render user's tweet
    addPost(newPost);
    setContent('');
    setMediaUrl('');
    setShowMediaInput(false);
    setIsSubmitting(false);

    if (onPostSuccess) {
      onPostSuccess();
    }

    // 2. Trigger the flood of AI character reactions!
    try {
      const wave = await AIService.triggerReactionWave(
        settings,
        activeWorld,
        characters,
        newPost,
        activeUser.id
      );

      // Increment views count with natural simulation
      setTimeout(() => {
        incrementViews(postId, wave.totalViewsAdded);
      }, 1500);

      // Schedule each reply with staggered timing and realistic typing indicators
      wave.replies.forEach((reply) => {
        // Show typing indicator a bit before the message appears
        const typingDelay = Math.max(300, reply.delayMs - 900);
        setTimeout(() => {
          addTypingCharacter(reply.characterId);
        }, typingDelay);

        // Append reply and remove typing indicator
        setTimeout(() => {
          removeTypingCharacter(reply.characterId);

          const replyPost: Post = {
            id: `reply_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            worldId: activeWorld.id,
            authorId: reply.characterId,
            content: reply.content,
            createdAt: Date.now(),
            replyToId: reply.replyToPostId,
            rootPostId: postId,
            likesCount: Math.floor(Math.random() * 5),
            repostsCount: 0,
            repliesCount: 0,
            viewsCount: Math.floor(Math.random() * 30) + 5,
            likedBy: [],
            repostedBy: [],
            bookmarkedBy: [],
            tags: [],
          };

          addPost(replyPost);

          // Add notification for the user
          addNotification({
            id: `notif_${Date.now()}_${Math.random()}`,
            worldId: activeWorld.id,
            type: 'reply',
            actorId: reply.characterId,
            targetPostId: postId,
            contentPreview: reply.content,
            createdAt: Date.now(),
            read: false,
          });

          // If character likes/reposts the user's post
          if (reply.likesParent) {
            toggleLike(postId, reply.characterId);
            addNotification({
              id: `notif_like_${Date.now()}_${Math.random()}`,
              worldId: activeWorld.id,
              type: 'like',
              actorId: reply.characterId,
              targetPostId: postId,
              createdAt: Date.now(),
              read: false,
            });
          }

          if (reply.repostsParent) {
            toggleRepost(postId, reply.characterId);
            addNotification({
              id: `notif_rt_${Date.now()}_${Math.random()}`,
              worldId: activeWorld.id,
              type: 'repost',
              actorId: reply.characterId,
              targetPostId: postId,
              createdAt: Date.now(),
              read: false,
            });
          }
        }, reply.delayMs);
      });
    } catch (err) {
      console.error('Error generating reaction wave:', err);
    }
  };

  const defaultPlaceholder = replyToPost
    ? 'Post your reply...'
    : `What is happening in ${activeWorld.name}?!`;

  return (
    <div
      className={`flex space-x-3 px-3 sm:px-4 py-3 ${
        isModal ? '' : 'border-b border-[#2f3336]'
      }`}
    >
      <div className="pt-1">
        <Avatar src={activeUser.avatar} name={activeUser.name} size="md" />
      </div>

      <div className="flex-1 min-w-0">
        {/* World audience indicator */}
        {!replyToPost && (
          <div className="flex items-center space-x-1.5 text-xs text-twitter-blue font-semibold mb-2 bg-twitter-blue/10 px-2.5 py-1 rounded-full w-fit">
            <Globe className="w-3.5 h-3.5" />
            <span>Posting to {activeWorld.name}</span>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          rows={isModal || replyToPost ? 3 : 2}
          className="w-full bg-transparent text-[#e7e9ea] text-lg placeholder-[#71767b] focus:outline-none resize-none"
        />

        {showMediaInput && (
          <div className="mt-2 mb-3">
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste Image URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-[#16181c] border border-[#2f3336] rounded-lg text-[#e7e9ea] focus:outline-none focus:border-twitter-blue"
            />
          </div>
        )}

        {/* Toolbar & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2f3336]/60">
          <div className="flex items-center space-x-1 -ml-2 text-twitter-blue">
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="p-2 hover:bg-twitter-blue/10 rounded-full transition-colors"
              title="Add Image"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setContent((prev) => prev + ' ⚡️')}
              className="p-2 hover:bg-twitter-blue/10 rounded-full transition-colors"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeWorld.trendingTopics[0]) {
                  setContent((prev) => `${prev} #${activeWorld.trendingTopics[0].tag}`);
                }
              }}
              className="p-2 hover:bg-twitter-blue/10 rounded-full transition-colors text-amber-400"
              title="Add Trending Tag"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {content.length > 0 && (
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs ${
                    charsRemaining < 20 ? 'text-red-500 font-bold' : 'text-[#71767b]'
                  }`}
                >
                  {charsRemaining}
                </span>
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#2f3336]"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        charsRemaining < 0
                          ? 'text-red-500'
                          : charsRemaining < 20
                          ? 'text-amber-500'
                          : 'text-twitter-blue'
                      }
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!content.trim() || charsRemaining < 0 || isSubmitting}
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-sm disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {replyToPost ? 'Reply' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
