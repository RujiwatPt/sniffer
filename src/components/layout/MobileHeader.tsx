import React from 'react';
import { Settings, Globe, Radio } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Avatar } from '../common/Avatar';

export const MobileHeader: React.FC = () => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getActiveUserCharacter } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { setSettingsOpen, setWorldSelectorOpen, setActiveView } = useSettingsStore();

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-black/80 backdrop-blur-md border-b border-[#2f3336]">
      {/* Profile Button */}
      <button
        onClick={() => setActiveView('profile')}
        className="focus:outline-none"
        aria-label="View Profile"
      >
        <Avatar src={activeUser.avatar} name={activeUser.name} size="sm" />
      </button>

      {/* Center Brand + World Switcher */}
      <button
        onClick={() => setWorldSelectorOpen(true)}
        className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#16181c] border border-[#2f3336] active:scale-95 transition-transform"
      >
        <Radio className="w-3.5 h-3.5 text-twitter-blue animate-pulse" />
        <span className="text-xs font-bold text-[#e7e9ea] truncate max-w-[140px]">
          {activeWorld.name}
        </span>
        <Globe className="w-3.5 h-3.5 text-[#71767b]" />
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="p-1.5 text-[#e7e9ea] hover:bg-[#181818] rounded-full transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-[#71767b]" />
      </button>
    </header>
  );
};
