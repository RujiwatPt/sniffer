import React from 'react';
import { Plus, RotateCcw, Check } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';

export const WorldSelectorModal: React.FC = () => {
  const {
    worlds,
    activeWorldId,
    setActiveWorldId,
    resetToDefaults: resetWorlds,
  } = useWorldStore();

  const {
    getCharactersByWorld,
    resetToDefaults: resetCharacters,
  } = useCharacterStore();

  const {
    getPostsByWorld,
    resetToDefaults: resetPosts,
  } = usePostStore();

  const {
    isWorldSelectorOpen,
    setWorldSelectorOpen,
    setWorldCreatorOpen,
  } = useSettingsStore();

  const handleSelectWorld = (worldId: string) => {
    setActiveWorldId(worldId);
    setWorldSelectorOpen(false);
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all worlds, characters, and posts back to initial presets?')) {
      resetWorlds();
      resetCharacters();
      resetPosts();
      setWorldSelectorOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isWorldSelectorOpen}
      onClose={() => setWorldSelectorOpen(false)}
      title="Select or Create Simulation World"
      maxWidth="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#71767b]">
          Choose the universe your social feed currently connects to. Each world has its own lore, factions, active characters, and trending events.
        </p>

        {/* Worlds List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {worlds.map((world) => {
            const isActive = world.id === activeWorldId;
            const charCount = getCharactersByWorld(world.id).length;
            const postCount = getPostsByWorld(world.id).length;

            return (
              <div
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between group ${
                  isActive
                    ? 'bg-[#16181c] border-twitter-blue/80 ring-1 ring-twitter-blue/40'
                    : 'bg-[#101214] border-[#2f3336] hover:border-[#42474d] hover:bg-[#16181c]/50'
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: world.themeAccent || '#1d9bf0' }}
                    />
                    <h3 className="font-bold text-base text-[#e7e9ea] group-hover:text-twitter-blue transition-colors">
                      {world.name}
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#202327] text-[#71767b]">
                      {world.atmosphere}
                    </span>
                  </div>

                  <p className="text-xs text-[#71767b] line-clamp-2 leading-relaxed">
                    {world.description}
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-[#71767b] pt-1">
                    <span>{charCount} Characters</span>
                    <span>·</span>
                    <span>{postCount} Timeline Posts</span>
                    <span>·</span>
                    <span>{world.trendingTopics.length} Trends</span>
                  </div>
                </div>

                <div className="flex items-center self-center shrink-0">
                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-twitter-blue flex items-center justify-center text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <button className="px-3 py-1 text-xs font-semibold rounded-full border border-[#2f3336] text-[#e7e9ea] group-hover:border-twitter-blue group-hover:text-twitter-blue transition-colors">
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#2f3336] flex items-center justify-between">
          <button
            onClick={handleResetAll}
            className="flex items-center space-x-1.5 text-xs text-[#71767b] hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Presets</span>
          </button>

          <button
            onClick={() => {
              setWorldSelectorOpen(false);
              setWorldCreatorOpen(true);
            }}
            className="px-4 py-2 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New World</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
