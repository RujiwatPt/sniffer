import { Character } from '../types/character';
import { World } from '../types/world';
import { TimeOfDay } from '../types/simulation';
import { CharacterRelationship } from '../types/relationship';
import { DirectMessage } from '../types/dm';
import { SocialStats } from '../types/socialStatus';
import { WorldMemoryEntry } from '../types/worldMemory';
import { useSocialStatusStore } from '../store/useSocialStatusStore';
import { useWorldMemoryStore } from '../store/useWorldMemoryStore';

export interface PromptContext {
  character: Character;
  world: World;
  userCharacter: Character;
  relationship?: CharacterRelationship;
  dayNumber: number;
  timeOfDay: TimeOfDay;
  recentMessages?: DirectMessage[];
  userStats?: SocialStats;
  recentMemories?: WorldMemoryEntry[];
}

export class RoleplayPromptBuilder {
  /**
   * Constructs an immersive roleplay system prompt based on proven persona & memory architectures
   */
  static buildDMPrompt(ctx: PromptContext): string {
    const { character, world, userCharacter, relationship, dayNumber, timeOfDay } = ctx;
    const affinity = relationship?.affinity ?? 0;
    const tier = relationship?.tier ?? 'neutral';

    const parts: string[] = [];

    // 1. Roleplay Persona Header
    parts.push(
      `[ROLEPLAY SIMULATION: ACTIVE]\nYou are roleplaying as @${character.handle} (${character.name}) inside the simulated universe "${world.name}".`
    );

    // 2. Character Definition
    parts.push(
      `<character_profile>\nName: ${character.name} (@${character.handle})\nArchetype: ${character.archetype}\nPersonality & Lore: ${character.personality}\nBio: ${character.bio}\nSpeech Style: ${character.speechStyle}\nCurrent Mood: ${character.mood || 'neutral'}\n</character_profile>`
    );

    // 3. World Context & Time of Day
    parts.push(
      `<world_state>\nWorld: ${world.name} (${world.atmosphere})\nLore & Directives: ${world.systemPrompt}\nSimulation Timeline: Day ${dayNumber}, ${timeOfDay.toUpperCase()}\nTime Setting: The current local time of day is ${timeOfDay}. Adjust your availability, energy, and routine accordingly.\n</world_state>`
    );

    // 4. User Profile, Social Reputation & Dynamic Relationship
    let userStatsText = '';
    const stats = ctx.userStats ?? (() => {
      try {
        return useSocialStatusStore.getState().getStats(world.id);
      } catch {
        return undefined;
      }
    })();
    if (stats) {
      userStatsText = `\nUser Social Reputation: Aura: ${stats.aura}/100, Charm: ${stats.charm}/100, Humor: ${stats.humor}/100, Ruthless: ${stats.ruthless}/100, Dark: ${stats.dark}/100`;
    }

    let worldMemoryText = '';
    const memories = ctx.recentMemories ?? (() => {
      try {
        return useWorldMemoryStore.getState().getMemories(world.id, 4);
      } catch {
        return [];
      }
    })();
    if (memories && memories.length > 0) {
      worldMemoryText = `\n\n<world_timeline_memory>\nRecent Timeline Events & Player Actions:\n${memories
        .map((m) => `- [${m.category}] @${m.actorHandle}: ${m.summary}`)
        .join('\n')}\n</world_timeline_memory>`;
    }

    parts.push(
      `<user_profile>\nYou are receiving a direct message from @${userCharacter.handle} (${userCharacter.name}).\nUser Archetype: ${userCharacter.archetype}${userStatsText}\nRelationship Status: ${tier.toUpperCase()} (Affinity: ${affinity}/100)\nRelationship Stance: ${character.stanceTowardsUser}\n${
        relationship?.durableFacts && relationship.durableFacts.length > 0
          ? `Memories & Learned Facts About User:\n${relationship.durableFacts.map((f) => `- ${f}`).join('\n')}\n`
          : ''
      }</user_profile>${worldMemoryText}`
    );

    // 5. Relationship Behavioral Directives
    const relationshipDirectives = this.getRelationshipDirectives(tier, character.name);

    // 6. Dialogue & Response Contract (adapted from chatbot repo)
    const contracts: string[] = [
      `RESPONSE RULES (CRITICAL):`,
      `- Stay 100% in character as ${character.name} at all times. Never mention you are an AI model or simulation.`,
      `- USER AGENCY: NEVER act, speak, react, or narrate thoughts on behalf of the user. Only control ${character.name}.`,
      `- SPOKEN DIALOGUE: Speak naturally in first-person ("I", "me", "my", "we"). Match your assigned speech style: "${character.speechStyle}".`,
      `- NARRATION / ACTIONS: Optional physical gestures or expressions may be formatted inside *asterisks* (e.g. *chuckles*, *types quickly*, *sighs*).`,
      `- CONCISENESS: This is a direct message chat (DM) like Twitter/X or Signal. Keep responses punchy, conversational, and direct (1 to 3 short sentences or paragraphs maximum, ~20-80 words). Do NOT output long essays.`,
      `- RELATIONSHIP DYNAMICS: ${relationshipDirectives}`,
    ];

    return [...parts, contracts.join('\n')].join('\n\n');
  }

  private static getRelationshipDirectives(tier: string, name: string): string {
    switch (tier) {
      case 'nemesis':
        return `${name} despises the user. Be hostile, mocking, dismissive, or menacing. Show zero willingness to cooperate unless coerced.`;
      case 'hostile':
        return `${name} dislikes the user. Respond with annoyance, sharp barbs, or suspicion. Ask why they are bothering to message you.`;
      case 'skeptical':
        return `${name} is wary and cautious. Question their motives, be reserved, and demand proof or reasons before trusting them.`;
      case 'neutral':
        return `${name} treats the user casually as an everyday acquaintance or fellow citizen. Be polite, indifferent, or casual.`;
      case 'friendly':
        return `${name} likes the user. Be warm, receptive, eager to chat, and share interesting happenings or gossip.`;
      case 'close_friend':
        return `${name} considers the user a trusted confidant. Speak freely, share inside jokes, personal thoughts, and show genuine care.`;
      case 'admirer':
        return `${name} holds the user in high regard. Show excitement, enthusiasm, admiration, and eagerness to impress or assist them.`;
      case 'soulmate':
        return `${name} has an unbreakable bond with the user. Be deeply loyal, affectionate, vulnerable, and completely open.`;
      default:
        return `${name} responds in their natural voice and archetype.`;
    }
  }
}
