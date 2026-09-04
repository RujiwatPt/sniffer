import React, { useState } from 'react';
import { Image, Smile, Globe, Sparkles } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSocialStatusStore } from '../../store/useSocialStatusStore';
import { useWorldMemoryStore } from '../../store/useWorldMemoryStore';
import { useRelationshipStore } from '../../store/useRelationshipStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { AIService } from '../../services/aiService';
import { SocialEvaluator } from '../../services/socialEvaluator';
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

    const postText = content.trim();

    // 1. Social status & tone evaluation
    const evaluation = SocialEvaluator.evaluateText(postText);
    if (evaluation.deltas.length > 0) {
      useSocialStatusStore.getState().applyDeltas(activeWorld.id, evaluation.deltas);
    }

    // 2. Persona-based affinity shifts for watching NPCs
    const affinityShifts = SocialEvaluator.evaluatePersonaAffinityShifts(
      characters,
      postText,
      evaluation.dominantTone,
      evaluation.deltas
    );

    Object.entries(affinityShifts).forEach(([charId, shift]) => {
      useRelationshipStore.getState().modifyAffinity(
        charId,
        activeWorld.id,
        shift.delta,
        shift.reason,
        'post'
      );
    });

    // 3. Save into World Memory
    useWorldMemoryStore.getState().addMemory({
      worldId: activeWorld.id,
      category: 'user_post',
      summary: postText.slice(0, 160),
      fullContent: postText,
      actorName: activeUser.name,
      actorHandle: activeUser.handle,
      socialImpact: evaluation.analysis,
      involvedNpcIds: Object.keys(affinityShifts),
    });

    // 4. Immediately render user's tweet
    addPost(newPost);
    setContent('');
    setMediaUrl('');
    setShowMediaInput(false);
    setIsSubmitting(false);

    if (onPostSuccess) {
      onPostSuccess();
    }

    // 5. Trigger the flood of AI character reactions!
    try {
      const { timeOfDay } = useSimulationStore.getState();
      const wave = await AIService.triggerReactionWave(
        settings,
        activeWorld,
        characters,
        newPost,
        activeUser.id,
        timeOfDay
      );

      // Increment views count with natural simulation
      setTimeout(() => {
        incrementViews(postId, wave.totalViewsAdded);
      }, 1500);

      // Pre-map character IDs to their created reply IDs so sub-replies that reference other NPCs link cleanly
      const charToReplyIdMap: Record<string, string> = {};
      wave.replies.forEach((r, idx) => {
        charToReplyIdMap[r.characterId] = `reply_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`;
      });

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

          const actualReplyId =
            charToReplyIdMap[reply.characterId] ||
            `reply_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

          // Check if this reply mentions an earlier replied character (cross-NPC banter)
          let directReplyTo = postId;
          const mentionedNpc = characters.find(
            (c) =>
              !c.isUser &&
              reply.content.includes(`@${c.handle}`) &&
              charToReplyIdMap[c.id]
          );
          if (mentionedNpc && charToReplyIdMap[mentionedNpc.id]) {
            directReplyTo = charToReplyIdMap[mentionedNpc.id];
          } else if (reply.replyToPostId && reply.replyToPostId !== postId) {
            directReplyTo = reply.replyToPostId;
          }

          const replyPost: Post = {
            id: actualReplyId,
            worldId: activeWorld.id,
            authorId: reply.characterId,
            content: reply.content,
            createdAt: Date.now(),
            replyToId: directReplyTo,
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
