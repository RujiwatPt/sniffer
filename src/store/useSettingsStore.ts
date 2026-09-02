import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AISettings, ThemeMode } from '../types/ai';

interface SettingsState {
  settings: AISettings;
  isSettingsOpen: boolean;
  isWorldSelectorOpen: boolean;
  isWorldCreatorOpen: boolean;
  isCharacterModalOpen: boolean;
  isEventTriggerOpen: boolean;
  isComposeModalOpen: boolean;
  activeView: 'feed' | 'world' | 'characters' | 'notifications' | 'profile';

  updateSettings: (partial: Partial<AISettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  setWorldSelectorOpen: (open: boolean) => void;
  setWorldCreatorOpen: (open: boolean) => void;
  setCharacterModalOpen: (open: boolean) => void;
  setEventTriggerOpen: (open: boolean) => void;
  setComposeModalOpen: (open: boolean) => void;
  setActiveView: (view: 'feed' | 'world' | 'characters' | 'notifications' | 'profile') => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
}

const defaultSettings: AISettings = {
  provider: 'simulation',
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  openAiApiKey: '',
  openAiBaseUrl: 'https://api.openai.com/v1',
  openAiModel: 'gpt-4o-mini',
  simulationSpeed: 'normal',
  autonomousFeed: true,
  autonomousIntervalSeconds: 35,
  themeMode: 'dark',
  accentColor: '#1d9bf0', // default Twitter blue
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isSettingsOpen: false,
      isWorldSelectorOpen: false,
      isWorldCreatorOpen: false,
      isCharacterModalOpen: false,
      isEventTriggerOpen: false,
      isComposeModalOpen: false,
      activeView: 'feed',

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setWorldSelectorOpen: (open) => set({ isWorldSelectorOpen: open }),
      setWorldCreatorOpen: (open) => set({ isWorldCreatorOpen: open }),
      setCharacterModalOpen: (open) => set({ isCharacterModalOpen: open }),
      setEventTriggerOpen: (open) => set({ isEventTriggerOpen: open }),
      setComposeModalOpen: (open) => set({ isComposeModalOpen: open }),
      setActiveView: (view) => set({ activeView: view }),

      setThemeMode: (mode) => {
        set((state) => ({
          settings: { ...state.settings, themeMode: mode },
        }));
      },

      setAccentColor: (color) => {
        set((state) => ({
          settings: { ...state.settings, accentColor: color },
        }));
      },
    }),
    {
      name: 'sniffer_settings_store_v1',
    }
  )
);
