import { World } from '../types/world';
import { Character } from '../types/character';
import { Post } from '../types/post';
import { AISettings, GeneratedWave } from '../types/ai';
import { DirectMessage } from '../types/dm';
import { CharacterRelationship } from '../types/relationship';
import { TimeOfDay } from '../types/simulation';
import { OpenRouterProvider } from './openRouterProvider';
import { SimulationEngine } from './simulationEngine';

export class AIService {
  static async triggerReactionWave(
    settings: AISettings,
    world: World,
    characters: Character[],
    post: Post,
    userCharacterId: string,
    timeOfDay?: TimeOfDay
  ): Promise<GeneratedWave> {
    if (settings.provider === 'openrouter' && settings.openRouterApiKey) {
      return OpenRouterProvider.generateWave(
        settings.openRouterApiKey,
        settings.openRouterModel,
        settings.openRouterSiteUrl,
        world,
        characters,
        post,
        userCharacterId,
        timeOfDay
      );
    }

    // Default: rich procedural simulation engine
    return SimulationEngine.generateReactionWave(world, characters, post, userCharacterId, timeOfDay);
  }

  static async triggerDMReply(
    settings: AISettings,
    world: World,
    character: Character,
    userCharacter: Character,
    relationship: CharacterRelationship | undefined,
    conversationHistory: DirectMessage[],
    userMessage: string,
    dayNumber: number,
    timeOfDay: TimeOfDay
  ): Promise<string> {
    if (settings.provider === 'openrouter' && settings.openRouterApiKey) {
      return OpenRouterProvider.generateDMReply(
        settings.openRouterApiKey,
        settings.openRouterModel,
        settings.openRouterSiteUrl,
        world,
        character,
        userCharacter,
        relationship,
        conversationHistory,
        userMessage,
        dayNumber,
        timeOfDay
      );
    }

    // Default & offline fallback: procedural simulation
    return SimulationEngine.generateProceduralDMReply(
      character,
      userCharacter,
      relationship,
      userMessage,
      timeOfDay
    );
  }
}
