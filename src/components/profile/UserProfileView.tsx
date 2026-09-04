import React, { useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { usePostStore } from '../../store/usePostStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { TweetCard } from '../feed/TweetCard';
import { SocialStatusRadar } from './SocialStatusRadar';

export const UserProfileView: React.FC = () => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getActiveUserCharacter } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { posts, setSelectedThreadPostId } = usePostStore();
  const [profileTab, setProfileTab] = useState<'posts' | 'replies' | 'likes'>('posts');

  const userPosts = posts.filter((p) => p.worldId === activeWorld.id && p.authorId === activeUser.id && !p.replyToId);
  const userReplies = posts.filter((p) => p.worldId === activeWorld.id && p.authorId === activeUser.id && p.replyToId);
  const userLikedPosts = posts.filter((p) => p.worldId === activeWorld.id && p.likedBy.includes(activeUser.id));

  const displayPosts = profileTab === 'posts' ? userPosts : profileTab === 'replies' ? userReplies : userLikedPosts;

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md px-4 py-2 border-b border-[#2f3336] flex items-center space-x-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#e7e9ea] leading-tight flex items-center">
            {activeUser.name}
            {activeUser.verified && (
              <VerifiedBadge type={activeUser.verifiedType} size={15} />
            )}
          </h2>
          <p className="text-xs text-[#71767b]">
            {userPosts.length} posts
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 sm:h-44 bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 relative overflow-hidden">
        {activeUser.bannerUrl && (
          <img
            src={activeUser.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Profile Details Header */}
      <div className="px-4 pb-4 border-b border-[#2f3336] relative">
        <div className="flex justify-between items-end -mt-14 mb-3">
          <div className="p-1 bg-black rounded-full inline-block">
            <Avatar src={activeUser.avatar} name={activeUser.name} size="xl" className="border-4 border-black" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-full bg-twitter-blue/10 text-twitter-blue font-bold border border-twitter-blue/30">
              Active Persona
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-[#e7e9ea] flex items-center">
            {activeUser.name}
            {activeUser.verified && (
              <VerifiedBadge type={activeUser.verifiedType} size={18} />
            )}
          </h1>
          <p className="text-sm text-[#71767b]">@{activeUser.handle}</p>
        </div>

        {/* Bio */}
        <p className="mt-3 text-sm text-[#e7e9ea] leading-relaxed">
          {activeUser.bio}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-[#71767b] mt-3">
          <div className="flex items-center space-x-1">
            <Globe className="w-4 h-4 text-twitter-blue" />
            <span>World: {activeWorld.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="capitalize">{activeUser.archetype} Archetype</span>
          </div>
        </div>

        {/* Following / Followers count */}
        <div className="flex space-x-4 text-xs mt-3">
          <div>
            <span className="font-bold text-[#e7e9ea]">
              {activeUser.followingCount.toLocaleString()}
            </span>{' '}
            <span className="text-[#71767b]">Following</span>
          </div>
          <div>
            <span className="font-bold text-[#e7e9ea]">
              {activeUser.followerCount.toLocaleString()}
            </span>{' '}
            <span className="text-[#71767b]">Followers</span>
          </div>
        </div>

        {/* Social Persona & Reputation Radar */}
        <div className="mt-4">
          <SocialStatusRadar />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336]">
        {(['posts', 'replies', 'likes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setProfileTab(tab)}
            className="flex-1 py-3 hover:bg-[#181818]/60 transition-colors flex justify-center items-center relative text-sm font-semibold capitalize"
          >
            <span
              className={profileTab === tab ? 'text-white font-bold' : 'text-[#71767b]'}
            >
              {tab}
            </span>
            {profileTab === tab && (
              <span className="absolute bottom-0 h-1 w-14 bg-twitter-blue rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="divide-y divide-[#2f3336]">
        {displayPosts.length === 0 ? (
          <div className="py-16 text-center text-[#71767b] text-sm">
            No {profileTab} yet for this persona.
          </div>
        ) : (
          displayPosts.map((post) => (
            <TweetCard
              key={post.id}
              post={post}
              onOpenThread={(p) => setSelectedThreadPostId(p.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
