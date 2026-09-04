import React from 'react';
import { useSocialStatusStore } from '../../store/useSocialStatusStore';
import { useWorldStore } from '../../store/useWorldStore';
import { STAT_METADATA, SocialStatKey } from '../../types/socialStatus';

interface SocialStatusRadarProps {
  compact?: boolean;
}

export const SocialStatusRadar: React.FC<SocialStatusRadarProps> = ({ compact = false }) => {
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();
  const { getStats } = useSocialStatusStore();

  const stats = getStats(activeWorld.id);
  const statKeys: SocialStatKey[] = ['aura', 'charm', 'humor', 'ruthless', 'dark'];

  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-[#16181c] border border-[#2f3336] space-y-2 select-none">
        <div className="flex items-center justify-between text-[11px] text-[#71767b]">
          <span className="font-bold uppercase tracking-wider">Social Reputation</span>
          <span className="text-[10px]">Your Traits</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
          {statKeys.map((key) => {
            const meta = STAT_METADATA[key];
            const val = stats[key] || 0;
            return (
              <div
                key={key}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#202327] border border-[#2f3336] shrink-0"
                title={`${meta.name}: ${val}/100 — ${meta.description}`}
              >
                <span>{meta.icon}</span>
                <span className="text-[#71767b]">{meta.name}:</span>
                <span className={`font-bold ${meta.color}`}>{val}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-[#16181c] border border-[#2f3336] space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#71767b]">
            Social Persona & Reputation
          </h3>
          <p className="text-[11px] text-[#71767b] mt-0.5">
            Your standing in {activeWorld.name} based on your posts, DMs, and decisions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {statKeys.map((key) => {
          const meta = STAT_METADATA[key];
          const val = stats[key] || 0;
          const pct = Math.min(100, Math.max(0, val));

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 font-semibold text-[#e7e9ea]">
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  {val >= 60 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white border border-white/20">
                      {meta.highTitle}
                    </span>
                  )}
                </div>
                <span className={`font-mono font-bold ${meta.color}`}>{val} / 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[#0c0d0e] overflow-hidden border border-[#2f3336]/40">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${meta.barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-[10px] text-[#71767b] line-clamp-1">{meta.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
