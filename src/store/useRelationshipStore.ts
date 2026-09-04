import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CharacterRelationship,
  RelationshipLog,
  getRelationshipTier,
  mapTierToStance,
} from '../types/relationship';
import { useCharacterStore } from './useCharacterStore';

interface RelationshipStoreState {
  relationships: Record<string, CharacterRelationship>;

  getRelationship: (characterId: string, worldId?: string) => CharacterRelationship;
  modifyAffinity: (
    characterId: string,
    worldId: string,
    delta: number,
    reason: string,
    source: RelationshipLog['source']
  ) => CharacterRelationship;
  addDurableFact: (characterId: string, fact: string, worldId?: string) => void;
  resetRelationships: () => void;
}

// Pure helper to compute initial relationship state without store mutation
const computeInitialRelationship = (characterId: string, worldId: string): CharacterRelationship => {
  let initialAffinity = 0;
  try {
    const char = useCharacterStore.getState().getCharacterById(characterId);
    if (char) {
      switch (char.stanceTowardsUser) {
        case 'simp':
          initialAffinity = 75;
          break;
        case 'admirer':
          initialAffinity = 60;
          break;
        case 'bestie':
          initialAffinity = 45;
          break;
        case 'rival':
          initialAffinity = -35;
          break;
        case 'hater':
          initialAffinity = -55;
          break;
        case 'skeptic':
          initialAffinity = -15;
          break;
        case 'neutral':
        default:
          initialAffinity = 0;
          break;
      }
    }
  } catch {
    // ignore lookup error
  }

  const tier = getRelationshipTier(initialAffinity);
  return {
    characterId,
    worldId,
    affinity: initialAffinity,
    tier,
    interactionsCount: 0,
    lastInteractedAt: Date.now(),
    durableFacts: [],
    history: [
      {
        id: `log_init_${Date.now()}`,
        timestamp: Date.now(),
        delta: 0,
        reason: 'Initial impression formed',
        source: 'day_cycle',
      },
    ],
  };
};

export const useRelationshipStore = create<RelationshipStoreState>()(
  persist(
    (set, get) => ({
      relationships: {},

      // Pure getter: returns stored record or initial computed value WITHOUT calling set() during render
      getRelationship: (characterId: string, worldId = 'world_cyberpunk') => {
        const { relationships } = get();
        const compositeKey = `${worldId}:${characterId}`;
        if (relationships[compositeKey]) {
          return relationships[compositeKey];
        }
        if (relationships[characterId]) {
          return relationships[characterId];
        }

        return computeInitialRelationship(characterId, worldId);
      },

      modifyAffinity: (characterId, worldId, delta, reason, source) => {
        const compositeKey = `${worldId}:${characterId}`;
        const { relationships } = get();
        const current =
          relationships[compositeKey] ||
          relationships[characterId] ||
          computeInitialRelationship(characterId, worldId);

        const newAffinity = Math.max(-100, Math.min(100, current.affinity + delta));
        const newTier = getRelationshipTier(newAffinity);

        const newLog: RelationshipLog = {
          id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          delta,
          reason,
          source,
        };

        const updated: CharacterRelationship = {
          ...current,
          worldId,
          characterId,
          affinity: newAffinity,
          tier: newTier,
          interactionsCount: current.interactionsCount + 1,
          lastInteractedAt: Date.now(),
          history: [newLog, ...current.history.slice(0, 40)],
        };

        set((state) => ({
          relationships: {
            ...state.relationships,
            [compositeKey]: updated,
          },
        }));

        // Synchronize character stance in character store
        try {
          const charStore = useCharacterStore.getState();
          const char = charStore.getCharacterById(characterId);
          if (char) {
            const nextStance = mapTierToStance(newTier);
            if (char.stanceTowardsUser !== nextStance) {
              charStore.updateCharacter({ ...char, stanceTowardsUser: nextStance });
            }
          }
        } catch {
          // ignore
        }

        return updated;
      },

      addDurableFact: (characterId: string, fact: string, worldId = 'world_cyberpunk') => {
        set((state) => {
          const compositeKey = `${worldId}:${characterId}`;
          // Find relationship by composite key or characterId
          const matchKey =
            Object.keys(state.relationships).find(
              (k) => k === compositeKey || k === characterId || k.endsWith(`:${characterId}`)
            ) || compositeKey;

          const rel = state.relationships[matchKey] || computeInitialRelationship(characterId, worldId);
          if (rel.durableFacts.includes(fact)) return state;

          return {
            relationships: {
              ...state.relationships,
              [matchKey]: {
                ...rel,
                durableFacts: [...rel.durableFacts, fact],
              },
            },
          };
        });
      },

      resetRelationships: () => {
        set({ relationships: {} });
      },
    }),
    {
      name: 'sniffer_relationship_store_v1',
    }
  )
);
