import { describe, it, expect } from 'vitest';
import { RoleplayPromptBuilder } from '../services/roleplayPromptBuilder';
import { OPENROUTER_PRESET_MODELS } from '../types/ai';
import { PRESET_WORLDS } from '../services/presetWorlds';

describe('OpenRouter & Roleplay System', () => {
  it('provides rich roleplay model presets adapted from chatbot repo', () => {
    expect(OPENROUTER_PRESET_MODELS.length).toBeGreaterThanOrEqual(5);

    const euryale = OPENROUTER_PRESET_MODELS.find((m) => m.id === 'sao10k/l3.3-euryale-70b');
    expect(euryale).toBeDefined();
    expect(euryale?.name).toContain('Euryale');

    const llama = OPENROUTER_PRESET_MODELS.find((m) => m.id === 'meta-llama/llama-3.3-70b-instruct');
    expect(llama).toBeDefined();
  });

  it('builds comprehensive roleplay DM system prompts with memory and rules', () => {
    const world = PRESET_WORLDS[0].world;
    const character = PRESET_WORLDS[0].characters[1];
    const userCharacter = PRESET_WORLDS[0].characters[0];

    const prompt = RoleplayPromptBuilder.buildDMPrompt({
      character,
      world,
      userCharacter,
      dayNumber: 3,
      timeOfDay: 'night',
      relationship: {
        characterId: character.id,
        worldId: world.id,
        affinity: 55,
        tier: 'close_friend',
        interactionsCount: 12,
        lastInteractedAt: Date.now(),
        durableFacts: ['Player saved Kira from district security'],
        history: [],
      },
    });

    // Check prompt structural tags and constraints
    expect(prompt).toContain('[ROLEPLAY SIMULATION: ACTIVE]');
    expect(prompt).toContain(`<character_profile>`);
    expect(prompt).toContain(`Name: ${character.name}`);
    expect(prompt).toContain(`<world_state>`);
    expect(prompt).toContain(`Day 3, NIGHT`);
    expect(prompt).toContain(`<user_profile>`);
    expect(prompt).toContain(`CLOSE_FRIEND (Affinity: 55/100)`);
    expect(prompt).toContain('Player saved Kira from district security');
    expect(prompt).toContain('NEVER act, speak, react, or narrate thoughts on behalf of the user');
  });
});
