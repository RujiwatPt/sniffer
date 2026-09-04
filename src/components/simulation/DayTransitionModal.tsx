import React from 'react';
import { Newspaper, Sparkles, TrendingUp, Sun, ArrowRight, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { Avatar } from '../common/Avatar';

export const DayTransitionModal: React.FC = () => {
  const { isTransitionModalOpen, setTransitionModalOpen, currentGazette, dayNumber } =
    useSimulationStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();
  const { getCharactersByWorld } = useCharacterStore();

  const characters = getCharactersByWorld(activeWorld.id).filter((c) => !c.isUser);
  const highlightedCharacters = characters.slice(0, 4);

  if (!currentGazette) return null;

  return (
    <Modal
      isOpen={isTransitionModalOpen}
      onClose={() => setTransitionModalOpen(false)}
      title=""
      maxWidth="lg"
    >
      <div className="space-y-5 -mt-2">
        {/* Banner Header */}
        <div className="text-center pb-4 border-b border-[#2f3336]">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
            <Sun className="w-3.5 h-3.5" />
            <span>Dawn of Day {dayNumber}</span>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-[#71767b] uppercase font-mono tracking-wider mb-1">
            <Newspaper className="w-4 h-4 text-twitter-blue" />
            <span>{activeWorld.name} Morning Gazette</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#e7e9ea] leading-tight px-2">
            {currentGazette.headline}
          </h2>
        </div>

        {/* Gazette Main Story */}
        <div className="p-4 rounded-2xl bg-[#14171a] border border-[#2f3336] space-y-3 text-sm">
          <p className="text-[#e7e9ea] leading-relaxed">
            {currentGazette.summary}
          </p>

          {currentGazette.breakingEvent && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">Overnight Bulletin:</span>
                <span>{currentGazette.breakingEvent}</span>
              </div>
            </div>
          )}

          {currentGazette.trendingTopic && (
            <div className="flex items-center justify-between text-xs text-[#71767b] pt-1">
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-twitter-blue" />
                <span>Trending Morning Topic:</span>
              </span>
              <span className="font-bold text-twitter-blue">#{currentGazette.trendingTopic}</span>
            </div>
          )}
        </div>

        {/* Character Morning Status */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#71767b] px-1 font-semibold uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>District Personalities Awakening</span>
            </span>
            <span>Morning Moods</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {highlightedCharacters.map((char) => (
              <div
                key={char.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#101214] border border-[#2f3336] text-xs"
              >
                <div className="flex items-center space-x-2.5 truncate pr-2">
                  <Avatar src={char.avatar} name={char.name} size="sm" />
                  <div className="truncate">
                    <span className="font-bold text-[#e7e9ea] block truncate">{char.name}</span>
                    <span className="text-[10px] text-[#71767b] truncate">@{char.handle}</span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#181b20] border border-[#2f3336] text-amber-300/90 shrink-0">
                  {char.mood || 'neutral'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Day Button */}
        <div className="pt-3 border-t border-[#2f3336] flex justify-end">
          <button
            onClick={() => setTransitionModalOpen(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-sm flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <span>Enter Day {dayNumber}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
