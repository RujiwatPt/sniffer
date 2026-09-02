import React, { useEffect } from 'react';
import { Bell, Heart, Repeat2, MessageCircle, Sparkles } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { usePostStore } from '../../store/usePostStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const NotificationsView: React.FC = () => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { notifications, markAllAsRead, clearNotifications } = useNotificationStore();
  const { getCharacterById } = useCharacterStore();
  const { setSelectedThreadPostId } = usePostStore();

  const worldNotifications = notifications.filter((n) => n.worldId === activeWorld.id);

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const formatTimestamp = (ts: number) => {
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-[#2f3336] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#e7e9ea]">Notifications</h2>
          <p className="text-xs text-[#71767b]">
            Simulation interactions in {activeWorld.name}
          </p>
        </div>

        {worldNotifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-[#71767b] hover:text-[#e7e9ea] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-[#2f3336]">
        {worldNotifications.length === 0 ? (
          <div className="py-20 text-center text-[#71767b] text-sm space-y-2">
            <Bell className="w-10 h-10 mx-auto text-[#2f3336]" />
            <p className="font-bold text-[#e7e9ea]">Nothing to see here — yet</p>
            <p className="text-xs">When roleplayed characters like, repost, or reply to you, they'll appear here.</p>
          </div>
        ) : (
          worldNotifications.map((notif) => {
            const actor = getCharacterById(notif.actorId);

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.targetPostId) {
                    setSelectedThreadPostId(notif.targetPostId);
                  }
                }}
                className={`p-4 transition-colors cursor-pointer flex space-x-3 hover:bg-[#0a0b0c] ${
                  !notif.read ? 'bg-twitter-blue/5' : ''
                }`}
              >
                {/* Icon Indicator */}
                <div className="shrink-0 pt-0.5">
                  {notif.type === 'like' && (
                    <Heart className="w-5 h-5 text-twitter-pink fill-current" />
                  )}
                  {notif.type === 'repost' && (
                    <Repeat2 className="w-5 h-5 text-twitter-green" />
                  )}
                  {notif.type === 'reply' && (
                    <MessageCircle className="w-5 h-5 text-twitter-blue fill-current" />
                  )}
                  {notif.type === 'world_event' && (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {actor && (
                    <div className="flex items-center space-x-2">
                      <Avatar src={actor.avatar} name={actor.name} size="sm" />
                      <span className="font-bold text-sm text-[#e7e9ea] truncate">
                        {actor.name}
                      </span>
                      {actor.verified && (
                        <VerifiedBadge type={actor.verifiedType} size={14} />
                      )}
                      <span className="text-xs text-[#71767b]">
                        @{actor.handle}
                      </span>
                      <span className="text-[#71767b] text-xs">·</span>
                      <span className="text-xs text-[#71767b]">
                        {formatTimestamp(notif.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-[#71767b]">
                    {notif.type === 'like' && 'liked your post'}
                    {notif.type === 'repost' && 'reposted your post'}
                    {notif.type === 'reply' && 'replied to you:'}
                    {notif.type === 'world_event' && 'broadcasted a world event'}
                  </div>

                  {notif.contentPreview && (
                    <p className="text-sm text-[#e7e9ea] italic bg-[#16181c] p-2 rounded-xl border border-[#2f3336]">
                      "{notif.contentPreview}"
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
