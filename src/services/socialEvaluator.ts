import { Character } from '../types/character';
import { SocialStatDelta, SocialStatEvaluation, SocialStatKey } from '../types/socialStatus';

export class SocialEvaluator {
  private static HUMOR_PATTERNS = [
    /\b(lol|lmao|lmfao|rofl|kek|haha|joke|meme|shitpost|ratio|skill issue|touch grass|bro really|nah fr|💀|😭|🤡|🤣)\b/i,
    /(\?{2,}|\!{2,})/,
  ];

  private static RUTHLESS_PATTERNS = [
    /\b(destroy|pathetic|crush|weak|eliminate|conquer|dominate|pay up|terminate|silence|unacceptable|fool|useless|enemy|threat)\b/i,
  ];

  private static CHARM_PATTERNS = [
    /\b(love|darling|beautiful|sweet|gorgeous|appreciate|friend|welcome|kind|honor|pleasure|charming|alluring|warm|grateful)\b/i,
  ];

  private static DARK_PATTERNS = [
    /\b(shadow|void|forbidden|conspiracy|covert|black market|classified|corrupt|rebel|overthrow|glitch|abyss|secrets|syndicate)\b/i,
  ];

  private static AURA_PATTERNS = [
    /\b(destiny|legacy|inevitable|command|witness|ascend|mastery|rule|vision|power|unmatched|sovereign|emperor|legend|king|queen)\b/i,
  ];

  /**
   * Evaluates text for tone and calculates social stat deltas
   */
  static evaluateText(text: string): SocialStatEvaluation {
    const deltas: SocialStatDelta[] = [];
    const lower = text.toLowerCase();

    // Scores
    let humorScore = 0;
    let ruthlessScore = 0;
    let charmScore = 0;
    let darkScore = 0;
    let auraScore = 0;

    for (const p of this.HUMOR_PATTERNS) {
      if (p.test(lower)) humorScore += 2;
    }
    for (const p of this.RUTHLESS_PATTERNS) {
      if (p.test(lower)) ruthlessScore += 3;
    }
    for (const p of this.CHARM_PATTERNS) {
      if (p.test(lower)) charmScore += 3;
    }
    for (const p of this.DARK_PATTERNS) {
      if (p.test(lower)) darkScore += 3;
    }
    for (const p of this.AURA_PATTERNS) {
      if (p.test(lower)) auraScore += 3;
    }

    // Length and sentence structure bonuses
    if (text.length > 140 && (auraScore > 0 || darkScore > 0)) {
      auraScore += 1;
    }

    // Baseline confidence gives Aura
    if (!lower.includes('sorry') && !lower.includes('maybe') && text.length > 20) {
      auraScore = Math.max(1, auraScore);
    }

    // Assign deltas
    if (humorScore > 0) {
      deltas.push({
        stat: 'humor',
        delta: Math.min(6, humorScore),
        reason: 'Witty banter and comedic flair',
      });
    }

    if (ruthlessScore > 0) {
      deltas.push({
        stat: 'ruthless',
        delta: Math.min(8, ruthlessScore),
        reason: 'Dominant and unapologetic posturing',
      });
    }

    if (charmScore > 0) {
      deltas.push({
        stat: 'charm',
        delta: Math.min(7, charmScore),
        reason: 'Charismatic and socially engaging approach',
      });
    }

    if (darkScore > 0) {
      deltas.push({
        stat: 'dark',
        delta: Math.min(7, darkScore),
        reason: 'Provocative intrigue and shadow cynicism',
      });
    }

    if (auraScore > 0) {
      deltas.push({
        stat: 'aura',
        delta: Math.min(5, auraScore),
        reason: 'Commanding timeline presence and self-assurance',
      });
    }

    // Determine dominant tone
    const scores: Array<{ stat: SocialStatKey; score: number }> = [
      { stat: 'humor', score: humorScore },
      { stat: 'ruthless', score: ruthlessScore },
      { stat: 'charm', score: charmScore },
      { stat: 'dark', score: darkScore },
      { stat: 'aura', score: auraScore },
    ];
    scores.sort((a, b) => b.score - a.score);

    const dominantTone = scores[0].score > 0 ? scores[0].stat : 'neutral';

    let analysis = 'Neutral casual observation';
    if (dominantTone === 'humor') analysis = 'Humorous timeline joke or meme';
    else if (dominantTone === 'ruthless') analysis = 'Aggressive dominance assertion';
    else if (dominantTone === 'charm') analysis = 'Charismatic social outreach';
    else if (dominantTone === 'dark') analysis = 'Dark subversive commentary';
    else if (dominantTone === 'aura') analysis = 'High-presence authoritative take';

    return {
      deltas,
      dominantTone,
      analysis,
    };
  }

  /**
   * Calculates how NPCs in the world react to the player's post based on their archetypes
   */
  static evaluatePersonaAffinityShifts(
    characters: Character[],
    text: string,
    dominantTone: SocialStatKey | 'neutral',
    _deltas: SocialStatDelta[]
  ): Record<string, { delta: number; reason: string }> {
    const shifts: Record<string, { delta: number; reason: string }> = {};

    characters.forEach((char) => {
      if (char.isUser) return;

      let shift = 0;
      let reason = '';

      switch (char.archetype) {
        case 'shitposter':
          if (dominantTone === 'humor') {
            shift = Math.floor(Math.random() * 3) + 3; // +3 to +5
            reason = 'Loved your chaotic humor and meme sense';
          } else if (dominantTone === 'ruthless') {
            shift = Math.random() > 0.5 ? 2 : -1;
            reason = 'Found your aggressive flex amusing';
          } else if (text.length > 200 && dominantTone === 'neutral') {
            shift = -2;
            reason = 'Found your wall of text tedious';
          }
          break;

        case 'agitator':
          if (dominantTone === 'ruthless' || dominantTone === 'dark') {
            shift = Math.floor(Math.random() * 3) + 4; // +4 to +6
            reason = 'Respected your rebellious, confrontational stance';
          } else if (dominantTone === 'charm') {
            shift = -2;
            reason = 'Distrusts overly polished diplomacy';
          }
          break;

        case 'corporate_shill':
          if (dominantTone === 'dark' || dominantTone === 'ruthless') {
            shift = -(Math.floor(Math.random() * 3) + 3); // -3 to -5
            reason = 'Alarmed by your disruptive and non-compliant rhetoric';
          } else if (dominantTone === 'charm' || dominantTone === 'aura') {
            shift = 3;
            reason = 'Appreciates your high-status network influence';
          }
          break;

        case 'intellectual':
          if (dominantTone === 'aura' || text.length > 100) {
            shift = 3;
            reason = 'Engaged with your articulate formulation';
          } else if (dominantTone === 'humor' && text.includes('💀')) {
            shift = -1;
            reason = 'Slightly put off by low-effort timeline slang';
          }
          break;

        case 'wholesome':
          if (dominantTone === 'charm') {
            shift = Math.floor(Math.random() * 3) + 4; // +4 to +6
            reason = 'Deeply touched by your warm and supportive energy';
          } else if (dominantTone === 'ruthless') {
            shift = -(Math.floor(Math.random() * 3) + 4); // -4 to -6
            reason = 'Hurt or repulsed by harsh aggression';
          }
          break;

        case 'conspiracy_theorist':
          if (dominantTone === 'dark') {
            shift = Math.floor(Math.random() * 4) + 4; // +4 to +7
            reason = 'Believes you see behind the veil of the official narrative';
          } else if (dominantTone === 'charm' || /\b(official|corporate|compliance|investor|synergy|governance)\b/i.test(text)) {
            shift = -4;
            reason = 'Suspects you are an asset of the establishment';
          }
          break;

        case 'celebrity':
          if (dominantTone === 'aura' || dominantTone === 'charm') {
            shift = 3;
            reason = 'Recognized your social clout and presence';
          } else if (dominantTone === 'ruthless') {
            shift = -2;
            reason = 'Dislikes public negativity on their timeline';
          }
          break;

        case 'doomer':
          if (dominantTone === 'dark') {
            shift = 4;
            reason = 'Nods in grim solidarity with your dark realism';
          } else if (dominantTone === 'charm') {
            shift = -2;
            reason = 'Considers optimistic cheerfulness delusional';
          }
          break;

        case 'mystic':
          if (dominantTone === 'dark' || dominantTone === 'aura') {
            shift = 3;
            reason = 'Sensed alignment in your timeline vibrations';
          }
          break;

        default:
          if (dominantTone === 'charm') shift = 1;
          else if (dominantTone === 'ruthless') shift = -1;
          reason = `Reacted to your ${dominantTone} tone`;
          break;
      }

      if (shift !== 0) {
        shifts[char.id] = { delta: shift, reason };
      }
    });

    return shifts;
  }
}
