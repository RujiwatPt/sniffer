import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeOfDay, DailyGazette, CharacterMood } from '../types/simulation';
import { World } from '../types/world';
import { SimulationEngine } from '../services/simulationEngine';
import { useCharacterStore } from './useCharacterStore';

interface SimulationStoreState {
  dayNumber: number;
  timeOfDay: TimeOfDay;
  isTransitionModalOpen: boolean;
  currentGazette: DailyGazette | null;
  gazetteHistory: DailyGazette[];

  advanceTime: (world?: World) => void;
  advanceToNextDay: (world?: World) => void;
  setTransitionModalOpen: (open: boolean) => void;
  resetSimulation: () => void;
}

const ORDERED_TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export const useSimulationStore = create<SimulationStoreState>()(
  persist(
    (set, get) => ({
      dayNumber: 1,
      timeOfDay: 'morning',
      isTransitionModalOpen: false,
      currentGazette: null,
      gazetteHistory: [],

      advanceTime: (world?: World) => {
        const { timeOfDay } = get();
        const currentIndex = ORDERED_TIMES.indexOf(timeOfDay);

        if (currentIndex === ORDERED_TIMES.length - 1) {
          // Night -> Advance to next day morning
          get().advanceToNextDay(world);
        } else {
          const nextTime = ORDERED_TIMES[currentIndex + 1];
          set({ timeOfDay: nextTime });
        }
      },

      advanceToNextDay: (world?: World) => {
        const nextDay = get().dayNumber + 1;
        const targetWorld = world || {
          id: 'world_cyberpunk',
          name: 'Neo-Veridia 2088',
          handle: 'neo_veridia',
          tagline: 'High Tech, Low Life',
          description: '',
          atmosphere: 'cyberpunk' as const,
          themeAccent: '#1d9bf0',
          trendingTopics: [{ tag: 'QuantumGrid', postCount: 14000, category: 'Tech' }],
          factions: [],
          systemPrompt: '',
          createdAt: Date.now(),
        };

        const gazette = SimulationEngine.generateDailyGazette(targetWorld, nextDay);

        // Randomize character moods for the new day
        try {
          const charStore = useCharacterStore.getState();
          const moods: CharacterMood[] = ['ecstatic', 'optimistic', 'neutral', 'annoyed', 'melancholy', 'chaotic', 'tired'];
          const worldChars = charStore.getCharactersByWorld(targetWorld.id);
          worldChars.forEach((c) => {
            if (!c.isUser) {
              const randomMood = moods[Math.floor(Math.random() * moods.length)];
              charStore.updateCharacter({ ...c, mood: randomMood });
            }
          });
        } catch {
          // ignore store circularity during SSR or test setup
        }

        set((state) => ({
          dayNumber: nextDay,
          timeOfDay: 'morning',
          currentGazette: gazette,
          gazetteHistory: [gazette, ...state.gazetteHistory],
          isTransitionModalOpen: true,
        }));
      },

      setTransitionModalOpen: (open: boolean) => {
        set({ isTransitionModalOpen: open });
      },

      resetSimulation: () => {
        set({
          dayNumber: 1,
          timeOfDay: 'morning',
          isTransitionModalOpen: false,
          currentGazette: null,
          gazetteHistory: [],
        });
      },
    }),
    {
      name: 'sniffer_simulation_store_v1',
    }
  )
);
