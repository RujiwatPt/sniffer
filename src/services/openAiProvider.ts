import { World } from '../types/world';
import { Character } from '../types/character';
import { Post } from '../types/post';
import { GeneratedWave, GeneratedReply } from '../types/ai';
import { SimulationEngine } from './simulationEngine';

export class OpenAIProvider {
  static async generateWave(
    apiKey: string,
    baseUrl: string,
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
RULES: ${world.systemPrompt}

TWEET BEING REACTED TO:
"${post.content}"

CHARACTERS IN WORLD:
${JSON.stringify(characterRosterSummary, null, 2)}

Generate a flood of 3 to 6 realistic, in-character social media replies to this tweet in JSON:
{
  "replies": [
    {
      "characterId": "<id of character>",
      "content": "<short in-character tweet text>",
      "likesParent": true,
      "repostsParent": false
    }
  ]
}`;

    const endpoint = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')}/chat/completions`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName || 'gpt-4o-mini',
          messages: [{ role: 'user', content: systemPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        console.warn(`OpenAI endpoint error ${response.status}. Falling back to simulation.`);
        return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
      }

      const parsed = JSON.parse(content);
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
        totalViewsAdded: Math.floor(Math.random() * 500) + 120,
      };
    } catch (err) {
      console.warn('OpenAI error, fallback to procedural simulation:', err);
      return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
    }
  }
}
