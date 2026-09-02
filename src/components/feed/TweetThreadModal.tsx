import React from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { usePostStore } from '../../store/usePostStore';
import { TweetCard } from './TweetCard';
import { TweetComposer } from './TweetComposer';

export const TweetThreadModal: React.FC = () => {
  const { selectedThreadPostId, setSelectedThreadPostId, getThreadData } = usePostStore();

  if (!selectedThreadPostId) return null;

  const threadData = getThreadData(selectedThreadPostId);
  if (!threadData) {
    return null;
  }

  const { rootPost, ancestors, replies } = threadData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
      {/* Thread Container */}
      <div className="relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[92vh] bg-black border sm:border-[#2f3336] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Thread Header */}
        <div className="sticky top-0 z-20 flex items-center px-4 py-3 bg-black/90 backdrop-blur-md border-b border-[#2f3336]">
          <button
            onClick={() => setSelectedThreadPostId(null)}
            className="p-2 -ml-2 text-[#e7e9ea] hover:bg-[#181818] rounded-full transition-colors mr-4"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-twitter-blue" />
            <h2 className="text-lg font-bold text-[#e7e9ea]">Thread</h2>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto">
          {/* Ancestors */}
          {ancestors.map((anc) => (
            <TweetCard
              key={anc.id}
              post={anc}
              showReplyLine={true}
              onOpenThread={(p) => setSelectedThreadPostId(p.id)}
            />
          ))}

          {/* Focused Tweet */}
          <div className="border-b border-[#2f3336]">
            <TweetCard
              post={rootPost}
              isMainThreadView={true}
              showReplyLine={replies.length > 0}
            />
          </div>

          {/* Inline Reply Composer */}
          <div className="border-b border-[#2f3336] bg-[#0c0d0e]">
            <TweetComposer
              replyToPost={rootPost}
              placeholder={`Reply to this thread...`}
            />
          </div>

          {/* Replies Cascade */}
          <div className="divide-y divide-[#2f3336]">
            {replies.length === 0 ? (
              <div className="py-12 text-center text-[#71767b] text-sm">
                No replies yet. Be the first to spark the simulation!
              </div>
            ) : (
              replies.map((reply) => (
                <TweetCard
                  key={reply.id}
                  post={reply}
                  onOpenThread={(p) => setSelectedThreadPostId(p.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
