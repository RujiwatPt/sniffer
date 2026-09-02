import { World } from '../types/world';
import { Character } from '../types/character';
import { Post } from '../types/post';
import { GeneratedWave, GeneratedReply } from '../types/ai';
import { SimulationEngine } from './simulationEngine';

export class GeminiProvider {
  static async generateWave(
    apiKey: string,
    modelName: string,
    world: World,
    characters: Character[],
    post: Post,
    userCharacterId: string
  ): Promise<GeneratedWave> {
    if (!apiKey) {
      return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
    }

    const availableCharacters = characters.filter((c) => c.id !== post.authorId);
    if (availableCharacters.length === 0) {
      return { replies: [], totalViewsAdded: 15 };
    }

    const characterRosterSummary = availableCharacters.map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      archetype: c.archetype,
      speechStyle: c.speechStyle,
      personality: c.personality,
      stanceTowardsUser: c.stanceTowardsUser,
    }));

    const systemPrompt = `You are a living social media simulation engine for an AI roleplay universe mimicking Twitter/X.
WORLD: "${world.name}"
ATMOSPHERE: ${world.atmosphere}
WORLD DESCRIPTION: ${world.description}
WORLD RULES/PROMPT: ${world.systemPrompt}

CURRENT TWEET BEING REACTED TO:
"${post.content}"
Author ID: ${post.authorId}

CHARACTERS IN THIS UNIVERSE:
${JSON.stringify(characterRosterSummary, null, 2)}

TASK:
Generate a flood of 3 to 6 realistic, in-character social media replies to this tweet.
Characters must act strictly according to their archetype, speech style, stance towards the user, and world lore!
Some characters should reply directly to the tweet.
Some characters can argue with or quote each other in the replies (nested sub-threads).
Include likes and reposts decisions.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "replies": [
    {
      "characterId": "<id of character>",
      "content": "<short in-character tweet text>",
      "isDirectReplyToRoot": true,
      "likesParent": true,
      "repostsParent": false
    }
  ]
}`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        console.warn(`Gemini API error ${response.status}. Falling back to simulation engine.`);
        return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
      }

      const parsed = JSON.parse(rawText);
      const rawReplies: Array<{
        characterId: string;
        content: string;
        isDirectReplyToRoot?: boolean;
        likesParent?: boolean;
        repostsParent?: boolean;
      }> = parsed.replies || [];

      let currentDelay = 800;
      const formattedReplies: GeneratedReply[] = rawReplies.map((r) => {
        currentDelay += Math.floor(Math.random() * 1200) + 600;
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
        totalViewsAdded: Math.floor(Math.random() * 500) + 120,
      };
    } catch (err) {
      console.warn('Gemini invocation error, fallback to procedural simulation engine:', err);
      return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
    }
  }
}
