import React from 'react';
import { Radio, Zap } from 'lucide-react';
import { usePostStore } from '../../store/usePostStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SimulationEngine } from '../../services/simulationEngine';
import { Post } from '../../types/post';

export const LiveSimulationTicker: React.FC = () => {
  const { typingCharacterIds, addPost } = usePostStore();
  const { getCharacterById, getCharactersByWorld } = useCharacterStore();
  const { getActiveWorld } = useWorldStore();
  const { settings } = useSettingsStore();

  const activeWorld = getActiveWorld();
  const characters = getCharactersByWorld(activeWorld.id);

  // Determine typing names
  const typingNames = typingCharacterIds
    .map((id) => getCharacterById(id)?.name || `@${getCharacterById(id)?.handle || 'someone'}`)
    .filter(Boolean);

  const handleSimulatePulse = () => {
    const npcs = characters.filter((c) => !c.isUser);
    if (npcs.length === 0) return;

    const randomAuthor = npcs[Math.floor(Math.random() * npcs.length)];
    const content = SimulationEngine.generateAutonomousPost(activeWorld, randomAuthor);

    const newPost: Post = {
      id: `auto_${Date.now()}`,
      worldId: activeWorld.id,
      authorId: randomAuthor.id,
      content,
      createdAt: Date.now(),
      likesCount: Math.floor(Math.random() * 20) + 1,
      repostsCount: Math.floor(Math.random() * 5),
      repliesCount: 0,
      viewsCount: Math.floor(Math.random() * 100) + 20,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: [],
    };

    addPost(newPost);
  };

  return (
    <div className="px-3 sm:px-4 py-2 border-b border-[#2f3336] bg-[#0c0d0e] flex items-center justify-between text-xs">
      <div className="flex items-center space-x-2 truncate pr-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        {typingNames.length > 0 ? (
          <span className="text-twitter-blue font-medium truncate animate-pulse flex items-center space-x-1">
            <Radio className="w-3 h-3 animate-spin shrink-0" />
            <span className="truncate">
              {typingNames.slice(0, 2).join(', ')}{' '}
              {typingNames.length > 2 ? `+${typingNames.length - 2}` : ''} typing...
            </span>
          </span>
        ) : (
          <span className="text-[#71767b] truncate text-[11px] sm:text-xs">
            <span className="text-[#e7e9ea] font-medium">{settings.provider.toUpperCase()}</span> ·{' '}
            <span className="text-[#e7e9ea]">{characters.length}</span>{' '}
            <span className="hidden sm:inline">characters active in {activeWorld.name}</span>
            <span className="sm:hidden">personas active</span>
          </span>
        )}
      </div>

      <button
        onClick={handleSimulatePulse}
        className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#1e2024] hover:bg-[#282a30] text-[#e7e9ea] text-[11px] font-semibold border border-[#2f3336] transition-colors active:scale-95"
        title="Trigger an autonomous character take"
      >
        <Zap className="w-3 h-3 text-amber-400" />
        <span>Pulse</span>
      </button>
    </div>
  );
};
