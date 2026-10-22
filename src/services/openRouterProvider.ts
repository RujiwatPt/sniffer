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
  private static readonly DIRECT_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly PROXY_URL = '/api/openrouter/chat/completions';

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
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sniffer.ai'),
        'X-Title': 'Sniffer AI Roleplay Social Simulation',
      };

      if (apiKey && apiKey.trim().length > 0) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      }

      const body: Record<string, unknown> = {
        model: modelName || 'meta-llama/llama-3.3-70b-instruct',
        messages,
        temperature,
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const endpoint = typeof window !== 'undefined'
        ? this.PROXY_URL
        : (apiKey ? this.DIRECT_URL : this.PROXY_URL);

      const response = await fetch(endpoint, {
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

CRITICAL TOPIC RELEVANCE REQUIREMENT:
- Every reply MUST directly reference, debate, critique, joke about, or answer the specific topic, claims, nouns, questions, or situation described in the tweet: "${post.content}".
- NEVER give generic boilerplate replies (e.g. "so true", "disagreed", "what are you on"). Replies must be unmistakably tailored to the exact content of the tweet above!

INTERACTION REQUIREMENT:
- 2 to 4 replies should be direct responses to the original post.
- 1 or 2 replies MUST be sub-replies that directly call out, quote, support, or roast one of the other characters' replies (e.g., start with "@<handle> ..."). NPCs should disagree, beef, or form alliances in the comments!
- Stay 100% in character for each persona's archetype and speech style.

Respond strictly with valid JSON only (no markdown preamble):
{
  "replies": [
    {
      "characterId": "<id of character from the available roster>",
      "content": "<in-character tweet reply addressing the specific tweet topic>",
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
      false,
      0.85
    );

    if (!rawText) {
      return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId, timeOfDay);
    }

    try {
      // Clean possible markdown fences and isolate JSON object
      let cleaned = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(cleaned);
      const rawReplies: Array<{
        characterId: string;
        content: string;
        likesParent?: boolean;
        repostsParent?: boolean;
      }> = parsed.replies || [];

      if (!rawReplies.length) {
        return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId, timeOfDay);
      }

      const availableIds = new Set(availableCharacters.map((c) => c.id));
      let currentDelay = 800;
      const formattedReplies: GeneratedReply[] = rawReplies.map((r, idx) => {
        currentDelay += Math.floor(Math.random() * 1100) + 700;
        // Validate character ID or fallback to round-robin from available roster
        const validCharId = availableIds.has(r.characterId)
          ? r.characterId
          : availableCharacters[idx % availableCharacters.length].id;

        return {
          characterId: validCharId,
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
