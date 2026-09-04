import { World } from '../types/world';
import { Character } from '../types/character';
import { Post } from '../types/post';
import { GeneratedWave, GeneratedReply } from '../types/ai';
import { DirectMessage } from '../types/dm';
import { CharacterRelationship } from '../types/relationship';
import { TimeOfDay } from '../types/simulation';
import { RoleplayPromptBuilder } from './roleplayPromptBuilder';
import { SimulationEngine } from './simulationEngine';

export class OpenRouterProvider {
  private static readonly BASE_URL = 'https://openrouter.ai/api/v1';

  /**
   * Helper to perform authenticated OpenRouter chat completion requests
   */
  private static async requestChatCompletion(
    apiKey: string,
    modelName: string,
    siteUrl: string | undefined,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode = false,
    temperature = 0.8
  ): Promise<string | null> {
    if (!apiKey) return null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': siteUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sniffer.ai'),
        'X-Title': 'Sniffer AI Roleplay Social Simulation',
      };

      const body: Record<string, unknown> = {
        model: modelName || 'sao10k/l3.3-euryale-70b',
        messages,
        temperature,
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        console.warn(`[OpenRouter] HTTP error ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      return typeof content === 'string' ? content.trim() : null;
    } catch (err) {
      console.warn('[OpenRouter] Network or parse error:', err);
      return null;
    }
  }

  /**
   * Generates a wave of character replies to a public tweet
   */
  static async generateWave(
    apiKey: string,
    modelName: string,
    siteUrl: string | undefined,
    world: World,
    characters: Character[],
    post: Post,
    userCharacterId: string,
    timeOfDay?: TimeOfDay
  ): Promise<GeneratedWave> {
    const availableCharacters = characters.filter((c) => c.id !== post.authorId);
    if (availableCharacters.length === 0) {
      return { replies: [], totalViewsAdded: 15 };
    }

    const rosterSummary = availableCharacters.slice(0, 8).map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      archetype: c.archetype,
      speechStyle: c.speechStyle,
      personality: c.personality,
      stanceTowardsUser: c.stanceTowardsUser,
      mood: c.mood || 'neutral',
    }));

    const systemPrompt = `You are the living social media simulation engine for an AI roleplay universe mirroring Twitter/X.
WORLD: "${world.name}"
ATMOSPHERE: ${world.atmosphere}
LORE DIRECTIVE: ${world.systemPrompt}
CURRENT TIME OF DAY: ${timeOfDay || 'afternoon'}

TWEET BEING REACTED TO:
"${post.content}"

AVAILABLE CHARACTERS IN THIS UNIVERSE:
${JSON.stringify(rosterSummary, null, 2)}

INSTRUCTIONS:
Generate 4 to 6 distinct, vivid in-character replies that feel like a fast-moving, chaotic Twitter/X comment section.
IMPORTANT INTERACTION REQUIREMENT:
- 2 to 4 replies should be direct responses to the original post.
- 1 or 2 replies MUST be sub-replies that directly call out, quote, support, or roast one of the other characters' replies (e.g., start with "@<handle> ..."). NPCs should disagree, beef, or form alliances in the comments!

Respond with JSON only:
{
  "replies": [
    {
      "characterId": "<id of character>",
      "content": "<in-character tweet reply. If debating another NPC, include their @handle>",
      "likesParent": true,
      "repostsParent": false
    }
  ]
}`;

    const rawText = await this.requestChatCompletion(
      apiKey,
      modelName,
      siteUrl,
      [{ role: 'user', content: systemPrompt }],
      true,
      0.85
    );

    if (!rawText) {
      return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId, timeOfDay);
    }

    try {
      // Clean possible markdown fences
      const cleaned = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const rawReplies: Array<{
        characterId: string;
        content: string;
        likesParent?: boolean;
        repostsParent?: boolean;
      }> = parsed.replies || [];

      let currentDelay = 800;
      const formattedReplies: GeneratedReply[] = rawReplies.map((r) => {
        currentDelay += Math.floor(Math.random() * 1100) + 700;
        return {
          characterId: r.characterId,
          content: r.content,
          replyToPostId: post.id,
          delayMs: currentDelay,
          likesParent: r.likesParent ?? false,
          repostsParent: r.repostsParent ?? false,
        };
      });

      return {
        replies: formattedReplies,
        totalViewsAdded: Math.floor(Math.random() * 500) + 140,
      };
    } catch {
      return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId, timeOfDay);
    }
  }

  /**
   * Generates a 1-on-1 Direct Message reply from a character to the user
   */
  static async generateDMReply(
    apiKey: string,
    modelName: string,
    siteUrl: string | undefined,
    world: World,
    character: Character,
    userCharacter: Character,
    relationship: CharacterRelationship | undefined,
    conversationHistory: DirectMessage[],
    userMessage: string,
    dayNumber: number,
    timeOfDay: TimeOfDay
  ): Promise<string> {
    const systemPrompt = RoleplayPromptBuilder.buildDMPrompt({
      character,
      world,
      userCharacter,
      relationship,
      dayNumber,
      timeOfDay,
      recentMessages: conversationHistory,
    });

    const messagesPayload: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Include up to last 10 previous conversation turns for context
    const recent = conversationHistory.slice(-10);
    for (const msg of recent) {
      const isFromUser = msg.senderId === userCharacter.id;
      messagesPayload.push({
        role: isFromUser ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current user message
    messagesPayload.push({ role: 'user', content: userMessage });

    const reply = await this.requestChatCompletion(
      apiKey,
      modelName,
      siteUrl,
      messagesPayload,
      false,
      0.8
    );

    if (!reply) {
      return SimulationEngine.generateProceduralDMReply(
        character,
        userCharacter,
        relationship,
        userMessage,
        timeOfDay
      );
    }

    return reply;
  }
}
