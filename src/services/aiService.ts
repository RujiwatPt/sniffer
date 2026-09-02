import { World } from '../types/world';
import { Character } from '../types/character';
import { Post } from '../types/post';
import { AISettings, GeneratedWave } from '../types/ai';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openAiProvider';
import { SimulationEngine } from './simulationEngine';

export class AIService {
  static async triggerReactionWave(
    settings: AISettings,
    world: World,
    characters: Character[],
    post: Post,
    userCharacterId: string
  ): Promise<GeneratedWave> {
    if (settings.provider === 'gemini' && settings.geminiApiKey) {
      return GeminiProvider.generateWave(
        settings.geminiApiKey,
        settings.geminiModel,
        world,
        characters,
        post,
        userCharacterId
      );
    }

    if (settings.provider === 'openai' && settings.openAiApiKey) {
      return OpenAIProvider.generateWave(
        settings.openAiApiKey,
        settings.openAiBaseUrl,
        settings.openAiModel,
        world,
        characters,
        post,
        userCharacterId
      );
    }

    // Default: rich procedural simulation engine
    return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId);
  }
}
