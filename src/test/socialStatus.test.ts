import { describe, it, expect, beforeEach } from 'vitest';
import { SocialEvaluator } from '../services/socialEvaluator';
import { useSocialStatusStore } from '../store/useSocialStatusStore';
import { PRESET_WORLDS } from '../services/presetWorlds';

describe('Social Status & Persona Reaction System', () => {
  const worldId = 'world_cyberpunk';

  beforeEach(() => {
    useSocialStatusStore.getState().resetStats(worldId);
  });

  it('correctly detects humor and applies stat deltas', () => {
    const evalResult = SocialEvaluator.evaluateText(
      'lmao bro really thought he could ratio me touch grass 💀'
    );
    expect(evalResult.dominantTone).toBe('humor');
    expect(evalResult.deltas.some((d) => d.stat === 'humor' && d.delta > 0)).toBe(true);
  });

  it('correctly detects ruthless domination tone', () => {
    const evalResult = SocialEvaluator.evaluateText(
      'Pathetic. I will crush and destroy anyone who stands against us.'
    );
    expect(evalResult.dominantTone).toBe('ruthless');
    expect(evalResult.deltas.some((d) => d.stat === 'ruthless' && d.delta > 0)).toBe(true);
  });

  it('correctly detects charm and social allure', () => {
    const evalResult = SocialEvaluator.evaluateText(
      'It is a true honor to meet you darling, such a kind and beautiful friend.'
    );
    expect(evalResult.dominantTone).toBe('charm');
    expect(evalResult.deltas.some((d) => d.stat === 'charm' && d.delta > 0)).toBe(true);
  });

  it('shifts NPC affinity according to archetype preferences', () => {
    const npcs = PRESET_WORLDS[0].characters; // cyberpunk characters
    const humorEval = SocialEvaluator.evaluateText('lmao pure comedy meme 💀');
    const shifts = SocialEvaluator.evaluatePersonaAffinityShifts(
      npcs,
      'lmao pure comedy meme 💀',
      humorEval.dominantTone,
      humorEval.deltas
    );

    // Shitposter character should gain affinity from humor
    const shitposter = npcs.find((c) => c.archetype === 'shitposter');
    if (shitposter) {
      expect(shifts[shitposter.id]).toBeDefined();
      expect(shifts[shitposter.id].delta).toBeGreaterThan(0);
    }

    // Ruthless test against Corporate Shill and Wholesome characters
    const ruthlessEval = SocialEvaluator.evaluateText('I will terminate and destroy your company.');
    const ruthlessShifts = SocialEvaluator.evaluatePersonaAffinityShifts(
      npcs,
      'I will terminate and destroy your company.',
      ruthlessEval.dominantTone,
      ruthlessEval.deltas
    );

    const corpShill = npcs.find((c) => c.archetype === 'corporate_shill');
    if (corpShill) {
      expect(ruthlessShifts[corpShill.id]).toBeDefined();
      expect(ruthlessShifts[corpShill.id].delta).toBeLessThan(0);
    }
  });

  it('updates, clamps, and tracks history in useSocialStatusStore', () => {
    const store = useSocialStatusStore.getState();
    const initial = store.getStats(worldId);
    expect(initial.aura).toBe(35);

    store.applyDeltas(worldId, [
      { stat: 'aura', delta: 10, reason: 'Commanding take' },
      { stat: 'ruthless', delta: 15, reason: 'Cutthroat deal' },
    ]);

    const updated = store.getStats(worldId);
    expect(updated.aura).toBe(45);
    expect(updated.ruthless).toBe(35);

    // Over-decrease to check clamping at 0
    store.applyDeltas(worldId, [{ stat: 'aura', delta: -100, reason: 'Embarrassing loss' }]);
    expect(store.getStats(worldId).aura).toBe(0);
  });
});
