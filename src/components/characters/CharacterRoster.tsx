import React, { useState } from 'react';
import { UserPlus, Sparkles, Check, ArrowRightLeft, Mail } from 'lucide-react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useRelationshipStore } from '../../store/useRelationshipStore';
import { useDMStore } from '../../store/useDMStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { RelationshipBadge } from '../relationships/RelationshipBadge';

export const CharacterRoster: React.FC = () => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const {
    getCharactersByWorld,
    getActiveUserCharacter,
    setActiveUserCharacterId,
    generateAndAddNPC,
  } = useCharacterStore();

  const characters = getCharactersByWorld(activeWorld.id);
  const activeUser = getActiveUserCharacter(activeWorld.id);
  const { getRelationship } = useRelationshipStore();
  const { getOrCreateThread, setActiveThreadId } = useDMStore();
  const { setCharacterModalOpen, setActiveView } = useSettingsStore();

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [filterArchetype, setFilterArchetype] = useState<string>('all');

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      generateAndAddNPC(activeWorld);
      setIsSynthesizing(false);
    }, 400);
  };

  const filteredCharacters = characters.filter((c) => {
    if (filterArchetype === 'all') return true;
    return c.archetype === filterArchetype;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur-md px-4 py-3 border-b border-[#2f3336] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Character Directory</h2>
          <p className="text-xs text-[#71767b]">
            {characters.length} active personas in {activeWorld.name}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-3.5 py-1.5 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSynthesizing ? 'Creating...' : 'Synthesize AI'}</span>
          </button>

          <button
            onClick={() => setCharacterModalOpen(true)}
            className="px-3.5 py-1.5 border border-[#2f3336] hover:bg-neutral-500/10 text-[var(--text-primary)] font-bold rounded-full text-xs flex items-center space-x-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Persona</span>
          </button>
        </div>
      </div>

      {/* Archetype Filter Pills */}
      <div className="flex items-center space-x-2 px-4 py-2 overflow-x-auto border-b border-[#2f3336] bg-[#0c0d0e] scrollbar-none">
        {['all', 'shitposter', 'intellectual', 'agitator', 'corporate_shill', 'wholesome', 'conspiracy_theorist', 'celebrity', 'mystic'].map((arch) => (
          <button
            key={arch}
            onClick={() => setFilterArchetype(arch)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap capitalize transition-all ${
              filterArchetype === arch
                ? 'bg-twitter-blue text-white font-bold'
                : 'bg-[#16181c] text-[#71767b] hover:text-[#e7e9ea] border border-[#2f3336]'
            }`}
          >
            {arch.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Active Persona Banner */}
      <div className="p-4 bg-[#16181c] border-b border-[#2f3336] flex items-center justify-between">
        <div className="flex items-center space-x-3 truncate">
          <Avatar src={activeUser.avatar} name={activeUser.name} size="md" />
          <div className="truncate">
            <div className="text-xs font-bold uppercase tracking-wider text-twitter-blue">
              Your Current Player Persona
            </div>
            <div className="text-sm font-bold text-white flex items-center truncate">
              {activeUser.name}
              {activeUser.verified && (
                <VerifiedBadge type={activeUser.verifiedType} size={14} />
              )}
              <span className="text-xs text-[#71767b] font-normal ml-2 truncate">
                @{activeUser.handle}
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-[#71767b] hidden sm:inline">
          Switch persona below to roleplay as any character
        </span>
      </div>

      {/* Roster Cards */}
      <div className="p-4 grid grid-cols-1 gap-3">
        {filteredCharacters.map((char) => {
          const isCurrentActive = char.id === activeUser.id;
          return (
            <div
              key={char.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isCurrentActive
                  ? 'bg-[#141d26] border-twitter-blue ring-1 ring-twitter-blue/40'
                  : 'bg-[#101214] border-[#2f3336] hover:border-[#3e444b]'
              }`}
            >
              {/* Top Row: Avatar, Name, Handle, Action */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <Avatar src={char.avatar} name={char.name} size="lg" />
                  <div className="truncate">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-bold text-base text-[#e7e9ea] truncate">
                        {char.name}
                      </span>
                      {char.verified && (
                        <VerifiedBadge type={char.verifiedType} size={16} />
                      )}
                    </div>
                    <div className="text-xs text-[#71767b] truncate">
                      @{char.handle}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1e2024] text-[#71767b] border border-[#2f3336]">
                        {char.archetype}
                      </span>
                      {!char.isUser && (
                        <>
                          <RelationshipBadge
                            affinity={getRelationship(char.id, activeWorld.id).affinity}
                            tier={getRelationship(char.id, activeWorld.id).tier}
                            size="xs"
                          />
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/30 text-amber-300/90 border border-amber-800/40">
                            {char.mood || 'neutral'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Message & Roleplay Switcher */}
                <div className="flex items-center space-x-2">
                  {!char.isUser && (
                    <button
                      onClick={() => {
                        const thread = getOrCreateThread(activeWorld.id, activeUser.id, char.id);
                        setActiveThreadId(thread.id);
                        setActiveView('messages');
                      }}
                      className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-twitter-blue/10 hover:bg-twitter-blue/20 text-twitter-blue border border-twitter-blue/30 transition-colors"
                      title="Send Direct Message"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  )}

                  {isCurrentActive ? (
                    <span className="flex items-center space-x-1 text-xs font-bold text-twitter-blue bg-twitter-blue/10 px-3 py-1.5 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Active You</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveUserCharacterId(char.id)}
                      className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#2f3336] text-[#e7e9ea] hover:border-twitter-blue hover:text-twitter-blue transition-colors"
                      title="Roleplay as this character"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Roleplay As</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-[#e7e9ea]/90 leading-relaxed">
                {char.bio}
              </p>

              {/* Speech style & stats */}
              <div className="pt-2 border-t border-[#2f3336]/60 flex items-center justify-between text-[11px] text-[#71767b]">
                <div className="truncate pr-2">
                  <span className="font-semibold text-[#8b98a5]">Speech Style:</span>{' '}
                  <span className="italic">{char.speechStyle}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0 font-medium">
                  <span>{char.followerCount.toLocaleString()} followers</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
