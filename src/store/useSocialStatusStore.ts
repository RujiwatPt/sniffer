import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SocialStats, SocialStatDelta } from '../types/socialStatus';

interface SocialStatusState {
  // worldId -> SocialStats
  statsByWorld: Record<string, SocialStats>;
  historyByWorld: Record<string, Array<{ timestamp: number; deltas: SocialStatDelta[] }>>;

  getStats: (worldId: string) => SocialStats;
  applyDeltas: (worldId: string, deltas: SocialStatDelta[]) => SocialStats;
  resetStats: (worldId: string) => void;
}

const DEFAULT_STATS: SocialStats = {
  aura: 35,
  charm: 35,
  humor: 35,
  ruthless: 20,
  dark: 20,
};

export const useSocialStatusStore = create<SocialStatusState>()(
  persist(
    (set, get) => ({
      statsByWorld: {},
      historyByWorld: {},

      getStats: (worldId: string) => {
        const existing = get().statsByWorld[worldId];
        if (existing) return existing;
        return DEFAULT_STATS;
      },

      applyDeltas: (worldId: string, deltas: SocialStatDelta[]) => {
        if (!deltas || deltas.length === 0) return get().getStats(worldId);

        const current = get().getStats(worldId);
        const next: SocialStats = { ...current };

        deltas.forEach((d) => {
          const updated = Math.min(100, Math.max(0, (next[d.stat] || 0) + d.delta));
          next[d.stat] = updated;
        });

        const history = get().historyByWorld[worldId] || [];
        const nextHistory = [
          { timestamp: Date.now(), deltas },
          ...history.slice(0, 49), // Keep 50 recent events
        ];

        set((state) => ({
          statsByWorld: {
            ...state.statsByWorld,
            [worldId]: next,
          },
          historyByWorld: {
            ...state.historyByWorld,
            [worldId]: nextHistory,
          },
        }));

        return next;
      },

      resetStats: (worldId: string) => {
        set((state) => ({
          statsByWorld: {
            ...state.statsByWorld,
            [worldId]: DEFAULT_STATS,
          },
          historyByWorld: {
            ...state.historyByWorld,
            [worldId]: [],
          },
        }));
      },
    }),
    {
      name: 'sniffer_social_status_storage',
    }
  )
);
