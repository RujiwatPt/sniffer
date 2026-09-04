import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '../store/useSimulationStore';
import { SimulationEngine } from '../services/simulationEngine';
import { PRESET_WORLDS } from '../services/presetWorlds';

describe('Simulation Day Progression', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetSimulation();
  });

  it('progresses through ordered time of day phases', () => {
    const store = useSimulationStore.getState();
    expect(store.dayNumber).toBe(1);
    expect(store.timeOfDay).toBe('morning');

    // morning -> afternoon
    store.advanceTime();
    expect(useSimulationStore.getState().timeOfDay).toBe('afternoon');
    expect(useSimulationStore.getState().dayNumber).toBe(1);

    // afternoon -> evening
    store.advanceTime();
    expect(useSimulationStore.getState().timeOfDay).toBe('evening');

    // evening -> night
    store.advanceTime();
    expect(useSimulationStore.getState().timeOfDay).toBe('night');

    // night -> advances to Day 2 morning
    store.advanceTime();
    expect(useSimulationStore.getState().dayNumber).toBe(2);
    expect(useSimulationStore.getState().timeOfDay).toBe('morning');
    expect(useSimulationStore.getState().isTransitionModalOpen).toBe(true);
  });

  it('directly advances to the next day with morning gazette', () => {
    const store = useSimulationStore.getState();
    const testWorld = PRESET_WORLDS[0].world;

    store.advanceToNextDay(testWorld);

    const state = useSimulationStore.getState();
    expect(state.dayNumber).toBe(2);
    expect(state.timeOfDay).toBe('morning');
    expect(state.currentGazette).not.toBeNull();
    expect(state.currentGazette?.dayNumber).toBe(2);
    expect(state.gazetteHistory.length).toBe(1);
  });

  it('generates autonomous posts flavored by time of day', () => {
    const testWorld = PRESET_WORLDS[0].world;
    const testChar = PRESET_WORLDS[0].characters[1];

    const morningPost = SimulationEngine.generateAutonomousPost(testWorld, testChar, 'morning');
    const nightPost = SimulationEngine.generateAutonomousPost(testWorld, testChar, 'night');

    expect(typeof morningPost).toBe('string');
    expect(morningPost.length).toBeGreaterThan(5);
    expect(typeof nightPost).toBe('string');
    expect(nightPost.length).toBeGreaterThan(5);
  });
});
