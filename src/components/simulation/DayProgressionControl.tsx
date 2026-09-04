import React from 'react';
import { Sun, CloudSun, Sunset, Moon, FastForward, BedDouble } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useWorldStore } from '../../store/useWorldStore';
import { TimeOfDay } from '../../types/simulation';

interface DayProgressionControlProps {
  compact?: boolean;
}

export const DayProgressionControl: React.FC<DayProgressionControlProps> = ({ compact = false }) => {
  const { dayNumber, timeOfDay, advanceTime, advanceToNextDay } = useSimulationStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const timeConfigs: Record<
    TimeOfDay,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
  > = {
    morning: { label: 'Morning', icon: CloudSun, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    afternoon: { label: 'Afternoon', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    evening: { label: 'Evening', icon: Sunset, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    night: { label: 'Night', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  };

  const currentConfig = timeConfigs[timeOfDay] || timeConfigs.morning;
  const TimeIcon = currentConfig.icon;

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5 bg-[#16181c] border border-[#2f3336] rounded-full px-2.5 py-1 text-xs">
        <TimeIcon className={`w-3.5 h-3.5 ${currentConfig.color}`} />
        <span className="font-bold text-[#e7e9ea]">Day {dayNumber}</span>
        <span className="text-[#71767b] text-[10px] uppercase font-mono">{currentConfig.label}</span>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-[#16181c] border border-[#2f3336] space-y-3 text-xs select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border ${currentConfig.bg} flex items-center justify-center`}>
            <TimeIcon className={`w-4 h-4 ${currentConfig.color} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm text-[#e7e9ea]">Day {dayNumber}</span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${currentConfig.bg} ${currentConfig.color}`}>
                {currentConfig.label}
              </span>
            </div>
            <p className="text-[11px] text-[#71767b]">
              Simulated universe timeline
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2f3336]/60">
        <button
          onClick={() => advanceTime(activeWorld)}
          className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-[#202327] hover:bg-[#272c30] text-[#e7e9ea] hover:text-twitter-blue border border-[#2f3336] transition-all active:scale-95 text-xs font-semibold"
          title="Advance to next time phase (Morning → Afternoon → Evening → Night)"
        >
          <FastForward className="w-3.5 h-3.5 text-twitter-blue shrink-0" />
          <span className="truncate">Next Phase</span>
        </button>

        <button
          onClick={() => advanceToNextDay(activeWorld)}
          className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-twitter-blue/15 hover:bg-twitter-blue/25 text-twitter-blue border border-twitter-blue/30 transition-all active:scale-95 text-xs font-bold shadow-sm"
          title="End day, sleep, and advance to next day morning"
        >
          <BedDouble className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Sleep / Day {dayNumber + 1}</span>
        </button>
      </div>
    </div>
  );
};
