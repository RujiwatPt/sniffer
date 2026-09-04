import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldMemoryEntry, MemoryCategory } from '../types/worldMemory';

interface WorldMemoryState {
  memoriesByWorld: Record<string, WorldMemoryEntry[]>;

  addMemory: (memory: Omit<WorldMemoryEntry, 'id' | 'timestamp'>) => WorldMemoryEntry;
  getMemories: (worldId: string, limit?: number) => WorldMemoryEntry[];
  getMemoriesByCategory: (worldId: string, category: MemoryCategory, limit?: number) => WorldMemoryEntry[];
  clearMemories: (worldId: string) => void;
}

export const useWorldMemoryStore = create<WorldMemoryState>()(
  persist(
    (set, get) => ({
      memoriesByWorld: {},

      addMemory: (memoryData) => {
        const entry: WorldMemoryEntry = {
          ...memoryData,
          id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
        };

        set((state) => {
          const current = state.memoriesByWorld[entry.worldId] || [];
          return {
            memoriesByWorld: {
              ...state.memoriesByWorld,
              [entry.worldId]: [entry, ...current].slice(0, 100), // Retain latest 100 timeline memories
            },
          };
        });

        return entry;
      },

      getMemories: (worldId: string, limit = 20) => {
        const all = get().memoriesByWorld[worldId] || [];
        return all.slice(0, limit);
      },

      getMemoriesByCategory: (worldId: string, category: MemoryCategory, limit = 20) => {
        const all = get().memoriesByWorld[worldId] || [];
        return all.filter((m) => m.category === category).slice(0, limit);
      },

      clearMemories: (worldId: string) => {
        set((state) => ({
          memoriesByWorld: {
            ...state.memoriesByWorld,
            [worldId]: [],
          },
        }));
      },
    }),
    {
      name: 'sniffer_world_memory_storage',
    }
  )
);
