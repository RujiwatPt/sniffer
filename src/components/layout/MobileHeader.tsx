import React from 'react';
import { Settings, Globe, Radio, Sparkles } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Avatar } from '../common/Avatar';

export const MobileHeader: React.FC = () => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getActiveUserCharacter } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { setSettingsOpen, setWorldSelectorOpen, setEventTriggerOpen, setActiveView } = useSettingsStore();

  return (
    <header
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
      className="sm:hidden sticky top-0 z-30 flex items-center justify-between px-3 py-2.5 bg-black/90 backdrop-blur-md border-b border-[#2f3336]"
    >
      {/* Profile Button */}
      <button
        onClick={() => setActiveView('profile')}
        className="focus:outline-none shrink-0"
        aria-label="View Profile"
      >
        <Avatar src={activeUser.avatar} name={activeUser.name} size="sm" />
      </button>

      {/* Center Brand + World Switcher */}
      <button
        onClick={() => setWorldSelectorOpen(true)}
        className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#16181c] border border-[#2f3336] active:scale-95 transition-transform max-w-[55%] truncate"
      >
        <Radio className="w-3.5 h-3.5 text-twitter-blue animate-pulse shrink-0" />
        <span className="text-xs font-bold text-[#e7e9ea] truncate">
          {activeWorld.name}
        </span>
        <Globe className="w-3.5 h-3.5 text-[#71767b] shrink-0" />
      </button>

      {/* Right Actions: Event trigger & Settings */}
      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={() => setEventTriggerOpen(true)}
          className="p-1.5 text-amber-400 hover:bg-amber-400/10 rounded-full transition-colors"
          title="Trigger World Event"
          aria-label="Trigger World Event"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#181818] rounded-full transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
