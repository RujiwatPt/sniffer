import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character } from '../types/character';
import { World } from '../types/world';
import { PRESET_WORLDS } from '../services/presetWorlds';
import { SimulationEngine } from '../services/simulationEngine';

interface CharacterState {
  characters: Character[];
  activeUserCharacterId: string;
  followingIds: Record<string, string[]>; // worldId -> followed characterIds
  getCharactersByWorld: (worldId: string) => Character[];
  getActiveUserCharacter: (worldId: string) => Character;
  getCharacterById: (id: string) => Character | undefined;
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  setActiveUserCharacterId: (id: string) => void;
  generateAndAddNPC: (world: World) => Character;
  isFollowing: (characterId: string, worldId: string) => boolean;
  toggleFollow: (characterId: string, worldId: string) => void;
  resetToDefaults: () => void;
}

const defaultCharacters = PRESET_WORLDS.flatMap((p) => p.characters);
const initialUser = defaultCharacters.find((c) => c.isUser)?.id || 'user_neo';

// Seed default following with the first 2 NPCs in each preset world
const initialFollowing: Record<string, string[]> = {};
PRESET_WORLDS.forEach((pw) => {
  const npcs = pw.characters.filter((c) => !c.isUser);
  initialFollowing[pw.world.id] = npcs.slice(0, 2).map((c) => c.id);
});

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: defaultCharacters,
      activeUserCharacterId: initialUser,
      followingIds: initialFollowing,

      getCharactersByWorld: (worldId: string) => {
        return get().characters.filter((c) => c.worldId === worldId);
      },

      getActiveUserCharacter: (worldId: string) => {
        const { characters, activeUserCharacterId } = get();
        // First try to find user's selected active user character in this world
        const active = characters.find((c) => c.id === activeUserCharacterId && c.worldId === worldId);
        if (active) return active;

        // Otherwise find any character marked as isUser in this world
        const worldUser = characters.find((c) => c.worldId === worldId && c.isUser);
        if (worldUser) return worldUser;

        // Fallback: return first character or create a default user
        const first = characters.find((c) => c.worldId === worldId);
        if (first) return first;

        return {
          id: `default_user_${worldId}`,
          worldId,
          name: 'Player',
          handle: 'player_one',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          bio: 'Observing the simulation timeline.',
          archetype: 'intellectual',
          speechStyle: 'casual',
          personality: 'Curious explorer of this simulated realm.',
          stanceTowardsUser: 'bestie',
          followerCount: 100,
          followingCount: 50,
          verified: true,
          verifiedType: 'blue',
          isUser: true,
          createdAt: Date.now(),
        };
      },

      getCharacterById: (id: string) => {
        return get().characters.find((c) => c.id === id);
      },

      addCharacter: (character: Character) => {
        set((state) => ({
          characters: [...state.characters, character],
        }));
      },

      updateCharacter: (updated: Character) => {
        set((state) => ({
          characters: state.characters.map((c) => (c.id === updated.id ? updated : c)),
        }));
      },

      deleteCharacter: (id: string) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        }));
      },

      setActiveUserCharacterId: (id: string) => {
        set({ activeUserCharacterId: id });
      },

      generateAndAddNPC: (world: World) => {
        const newChar = SimulationEngine.generateProceduralCharacter(world);
        set((state) => ({
          characters: [...state.characters, newChar],
        }));
        return newChar;
      },

      isFollowing: (characterId: string, worldId: string) => {
        const { followingIds } = get();
        const list = followingIds[worldId] || [];
        return list.includes(characterId);
      },

      toggleFollow: (characterId: string, worldId: string) => {
        set((state) => {
          const list = state.followingIds[worldId] || [];
          const currentlyFollowing = list.includes(characterId);
          const nextList = currentlyFollowing
            ? list.filter((id) => id !== characterId)
            : [...list, characterId];

          // Update follower count on the target character
          const updatedCharacters = state.characters.map((c) => {
            if (c.id === characterId) {
              return {
                ...c,
                followerCount: Math.max(0, c.followerCount + (currentlyFollowing ? -1 : 1)),
              };
            }
            return c;
          });

          return {
            followingIds: {
              ...state.followingIds,
              [worldId]: nextList,
            },
            characters: updatedCharacters,
          };
        });
      },

      resetToDefaults: () => {
        set({
          characters: defaultCharacters,
          activeUserCharacterId: initialUser,
          followingIds: initialFollowing,
        });
      },
    }),
    {
      name: 'sniffer_character_store_v1',
    }
  )
);
