import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { World, WorldEvent } from '../types/world';
import { PRESET_WORLDS } from '../services/presetWorlds';

interface WorldState {
  worlds: World[];
  activeWorldId: string;
  worldEvents: WorldEvent[];
  getActiveWorld: () => World;
  setActiveWorldId: (id: string) => void;
  addWorld: (world: World) => void;
  updateWorld: (world: World) => void;
  deleteWorld: (id: string) => void;
  triggerWorldEvent: (event: WorldEvent) => void;
  resetToDefaults: () => void;
}

const defaultWorlds = PRESET_WORLDS.map((p) => p.world);
const defaultActiveWorldId = defaultWorlds[0]?.id || 'world_cyberpunk';

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      worlds: defaultWorlds,
      activeWorldId: defaultActiveWorldId,
      worldEvents: [],

      getActiveWorld: () => {
        const { worlds, activeWorldId } = get();
        return worlds.find((w) => w.id === activeWorldId) || worlds[0];
      },

      setActiveWorldId: (id: string) => {
        set({ activeWorldId: id });
      },

      addWorld: (world: World) => {
        set((state) => ({
          worlds: [world, ...state.worlds],
          activeWorldId: world.id,
        }));
      },

      updateWorld: (updated: World) => {
        set((state) => ({
          worlds: state.worlds.map((w) => (w.id === updated.id ? updated : w)),
        }));
      },

      deleteWorld: (id: string) => {
        set((state) => {
          const remaining = state.worlds.filter((w) => w.id !== id);
          const nextActive = state.activeWorldId === id ? remaining[0]?.id || '' : state.activeWorldId;
          return {
            worlds: remaining,
            activeWorldId: nextActive,
          };
        });
      },

      triggerWorldEvent: (event: WorldEvent) => {
        set((state) => ({
          worldEvents: [event, ...state.worldEvents],
        }));
      },

      resetToDefaults: () => {
        set({
          worlds: defaultWorlds,
          activeWorldId: defaultActiveWorldId,
          worldEvents: [],
        });
      },
    }),
    {
      name: 'sniffer_world_store_v1',
    }
  )
);
