import React, { useState } from 'react';
import { Search, Sparkles, UserPlus, Globe, TrendingUp } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const RightSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getCharactersByWorld, generateAndAddNPC } = useCharacterStore();
  const characters = getCharactersByWorld(activeWorld.id);
  const npcs = characters.filter((c) => !c.isUser);

  const { setWorldSelectorOpen, setEventTriggerOpen, setActiveView } = useSettingsStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNPC = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateAndAddNPC(activeWorld);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-88 h-screen sticky top-0 px-4 py-3 space-y-4 overflow-y-auto border-l border-[#2f3336]">
      {/* Search Bar */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md pb-2 z-10">
        <div className="relative flex items-center bg-[#202327] rounded-full focus-within:bg-black focus-within:ring-1 focus-within:ring-twitter-blue transition-all">
          <Search className="w-4 h-4 ml-4 text-[#71767b] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${activeWorld.name}...`}
            className="w-full bg-transparent px-3 py-2.5 text-sm text-[#e7e9ea] placeholder-[#71767b] focus:outline-none"
          />
        </div>
      </div>

      {/* World Overview Card */}
      <div className="bg-[#16181c] rounded-2xl p-4 border border-[#2f3336] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-twitter-blue" />
            <h3 className="font-extrabold text-[#e7e9ea] text-base">Active World</h3>
          </div>
          <button
            onClick={() => setWorldSelectorOpen(true)}
            className="text-xs font-semibold text-twitter-blue hover:underline"
          >
            Switch
          </button>
        </div>

        <div>
          <div className="text-lg font-bold text-white flex items-center space-x-2">
            <span>{activeWorld.name}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider text-black font-semibold"
              style={{ backgroundColor: activeWorld.themeAccent || '#1d9bf0' }}
            >
              {activeWorld.atmosphere}
            </span>
          </div>
          <p className="text-xs text-[#71767b] mt-1 line-clamp-3 leading-relaxed">
            {activeWorld.description}
          </p>
        </div>

        {/* Quick Simulation Actions */}
        <div className="pt-2 border-t border-[#2f3336] flex flex-col space-y-2">
          <button
            onClick={() => setEventTriggerOpen(true)}
            className="w-full py-2 px-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Trigger Breaking News</span>
          </button>

          <button
            onClick={handleGenerateNPC}
            disabled={isGenerating}
            className="w-full py-2 px-3 bg-[#202327] hover:bg-[#272c30] text-[#e7e9ea] font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 text-twitter-blue" />
            <span>{isGenerating ? 'Synthesizing...' : 'Add AI Character'}</span>
          </button>
        </div>
      </div>

      {/* World Trends */}
      <div className="bg-[#16181c] rounded-2xl py-3 border border-[#2f3336]">
        <h3 className="font-extrabold text-[#e7e9ea] text-base px-4 pb-2">
          Trends in {activeWorld.name}
        </h3>

        <div className="flex flex-col">
          {activeWorld.trendingTopics.slice(0, 4).map((trend, idx) => (
            <div
              key={idx}
              className="px-4 py-2.5 hover:bg-[#1c1f23] transition-colors cursor-pointer"
            >
              <div className="text-xs text-[#71767b] flex items-center justify-between">
                <span>{trend.category} · Trending</span>
                <TrendingUp className="w-3.5 h-3.5 text-twitter-blue" />
              </div>
              <div className="font-bold text-sm text-[#e7e9ea] mt-0.5">
                #{trend.tag}
              </div>
              <div className="text-xs text-[#71767b] mt-0.5">
                {trend.postCount.toLocaleString()} posts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Characters / Who to follow */}
      <div className="bg-[#16181c] rounded-2xl py-3 border border-[#2f3336]">
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="font-extrabold text-[#e7e9ea] text-base">Key Figures</h3>
          <button
            onClick={() => setActiveView('characters')}
            className="text-xs font-semibold text-twitter-blue hover:underline"
          >
            View All ({characters.length})
          </button>
        </div>

        <div className="flex flex-col">
          {npcs.slice(0, 3).map((npc) => (
            <div
              key={npc.id}
              className="px-4 py-2.5 hover:bg-[#1c1f23] transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 truncate">
                <Avatar src={npc.avatar} name={npc.name} size="md" />
                <div className="truncate">
                  <div className="text-sm font-bold text-[#e7e9ea] truncate flex items-center group-hover:underline">
                    {npc.name}
                    {npc.verified && (
                      <VerifiedBadge type={npc.verifiedType} size={13} />
                    )}
                  </div>
                  <div className="text-xs text-[#71767b] truncate">
                    @{npc.handle}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202327] text-[#71767b] shrink-0">
                {npc.archetype}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-xs text-[#71767b] px-4 space-y-1">
        <div className="flex flex-wrap gap-x-2">
          <span>Sniffer Simulation v1.0</span>
          <span>·</span>
          <span>Roleplay Social Media</span>
        </div>
        <div>© 2026 Sniffer Labs. All characters are simulated.</div>
      </div>
    </aside>
  );
};
