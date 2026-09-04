import React from 'react';
import { UserPlus, ShieldAlert, Shield, Hash, Users, BookOpen } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useWorldMemoryStore } from '../../store/useWorldMemoryStore';

export const WorldDetailView: React.FC = () => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getCharactersByWorld, generateAndAddNPC } = useCharacterStore();
  const characters = getCharactersByWorld(activeWorld.id);

  const { setWorldSelectorOpen, setEventTriggerOpen } = useSettingsStore();
  const { getMemories } = useWorldMemoryStore();
  const memories = getMemories(activeWorld.id, 10);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#16181c] to-[#0c0d0e] border border-[#2f3336] relative overflow-hidden space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-mono uppercase font-bold text-black inline-block mb-2"
                style={{ backgroundColor: activeWorld.themeAccent || '#1d9bf0' }}
              >
                {activeWorld.atmosphere} Realm
              </span>
              <span className="text-xs text-[#71767b] flex items-center space-x-1 mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>{characters.length} Personas</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeWorld.name}
            </h1>
            <p className="text-sm text-twitter-blue font-mono">@{activeWorld.handle}</p>
          </div>

          <button
            onClick={() => setWorldSelectorOpen(true)}
            className="px-4 py-1.5 rounded-full border border-[#2f3336] text-xs font-semibold text-[#e7e9ea] hover:border-twitter-blue hover:text-twitter-blue transition-colors"
          >
            Switch World
          </button>
        </div>

        <p className="text-sm sm:text-base text-[#e7e9ea] leading-relaxed">
          {activeWorld.description}
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setEventTriggerOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center space-x-2 hover:bg-amber-500/20 transition-colors shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Trigger World Encounter (1-2 NPCs)</span>
          </button>

          <button
            onClick={() => generateAndAddNPC(activeWorld)}
            className="px-4 py-2 rounded-xl bg-twitter-blue/10 border border-twitter-blue/30 text-twitter-blue font-bold text-xs flex items-center space-x-2 hover:bg-twitter-blue/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Spawn New AI Persona</span>
          </button>
        </div>
      </div>

      {/* Factions Section */}
      {activeWorld.factions && activeWorld.factions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#71767b]">
            <Shield className="w-4 h-4 text-twitter-blue" />
            <span>Dominant Factions & Powers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeWorld.factions.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-[#16181c] border border-[#2f3336] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#e7e9ea]">{f.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202327] text-twitter-blue">
                    {f.stance}
                  </span>
                </div>
                <p className="text-xs text-[#71767b] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Topics & Hashtags */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#71767b]">
          <Hash className="w-4 h-4 text-twitter-blue" />
          <span>Trending Real-time Hashtags</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {activeWorld.trendingTopics.map((trend, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#16181c] border border-[#2f3336] space-y-1"
            >
              <div className="text-[10px] text-[#71767b] truncate">{trend.category}</div>
              <div className="font-bold text-sm text-[#e7e9ea] truncate">
                #{trend.tag}
              </div>
              <div className="text-[11px] text-[#71767b]">
                {trend.postCount.toLocaleString()} posts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Living World Memory & Timeline Archive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#71767b]">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Living World Memory & Timeline Archive</span>
          </div>
          <span className="text-[11px] text-[#71767b] font-mono">
            {memories.length} records remembered
          </span>
        </div>

        {memories.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#16181c] border border-[#2f3336] text-center text-xs text-[#71767b]">
            No recorded timeline events yet. Post, DM characters, or resolve an encounter to etch memories into this realm!
          </div>
        ) : (
          <div className="divide-y divide-[#2f3336] rounded-2xl bg-[#16181c] border border-[#2f3336] overflow-hidden">
            {memories.map((m) => (
              <div key={m.id} className="p-3.5 space-y-1 hover:bg-[#1f2227] transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-black text-twitter-blue border border-twitter-blue/30 font-bold">
                      {m.category}
                    </span>
                    <span className="font-bold text-[#e7e9ea]">@{m.actorHandle}</span>
                  </div>
                  <time className="text-[10px] text-[#71767b]">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                <p className="text-xs text-[#e7e9ea]/90 leading-relaxed">{m.summary}</p>
                {m.socialImpact && (
                  <p className="text-[10px] text-amber-300/80 font-mono">
                    ⚡️ {m.socialImpact}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* World System Instructions / Atmosphere Lore */}
      <div className="space-y-2 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#71767b] block">
          Simulation Prompt Directive
        </span>
        <p className="text-xs font-mono text-[#8b98a5] leading-relaxed">
          {activeWorld.systemPrompt}
        </p>
      </div>
    </div>
  );
};
