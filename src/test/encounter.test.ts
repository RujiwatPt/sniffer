import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../services/simulationEngine';
import { PRESET_WORLDS } from '../services/presetWorlds';

describe('Interactive Encounter System', () => {
  it('generates a randomized dilemma involving 1 or at most 2 NPCs', () => {
    const world = PRESET_WORLDS[0].world;
    const characters = PRESET_WORLDS[0].characters;

    for (let i = 0; i < 10; i++) {
      const encounter = SimulationEngine.generateEncounter(world, characters);

      expect(encounter).toBeDefined();
      expect(encounter.id).toBeDefined();
      expect(encounter.title.length).toBeGreaterThan(0);
      expect(encounter.situation.length).toBeGreaterThan(20);

      // Must be 1 or 2 NPCs at most per user requirement!
      expect(encounter.involvedNpcIds.length).toBeGreaterThanOrEqual(1);
      expect(encounter.involvedNpcIds.length).toBeLessThanOrEqual(2);

      // Must provide multiple actionable options
      expect(encounter.options.length).toBeGreaterThanOrEqual(3);

      encounter.options.forEach((opt) => {
        expect(opt.label.length).toBeGreaterThan(0);
        expect(opt.actionText.length).toBeGreaterThan(0);
        expect(opt.statChanges).toBeDefined();
        expect(opt.affinityChanges).toBeDefined();
      });
    }
  });
});
