import { World, WorldEvent } from '../types/world';
import { Character, CharacterArchetype } from '../types/character';
import { Post } from '../types/post';
import { GeneratedReply, GeneratedWave } from '../types/ai';
import { TimeOfDay, DailyGazette } from '../types/simulation';
import { CharacterRelationship } from '../types/relationship';
import { WorldEncounter } from '../types/encounter';

// Archetype response templates tailored with contextual slots
const ARCHETYPE_PATTERNS: Record<CharacterArchetype, {
  agree: string[];
  disagree: string[];
  mock: string[];
  question: string[];
  autonomousTakes: string[];
}> = {
  shitposter: {
    agree: [
      'lmao exactly this. finally someone with more than 2 brain cells posting',
      'real and true. framing this on my wall',
      'common W take, the timeline needed to hear this today fr',
      'dropped your crown king 👑',
    ],
    disagree: [
      'bro what kind of hallucinogens are you on rn 💀',
      'worst take of the decade award goes to you congratulations',
      'delete this before the whole district sees it lmao',
      'did your neural implant glitch or do you actually believe this??',
    ],
    mock: [
      'rent free in your head forever lmao',
      'who let bro cook 😭🍳',
      'skill issue tbh',
      'source: it was revealed to you in a fever dream',
    ],
    question: [
      'wait r u being serious rn or is this bait??',
      'can someone explain this in toddler terms please',
    ],
    autonomousTakes: [
      'just remembered that tomorrow is monday and my will to live dropped 400%',
      'unpopular opinion: half of you wouldn\'t survive without autocorrect and coffee',
      'currently having a high stakes mental breakdown in 4K resolution',
      'if nobody got me i know my bad financial decisions got me',
    ]
  },
  intellectual: {
    agree: [
      'An incisive point. The empirical data strongly corroborates this thesis.',
      'Precisely. People fundamentally misunderstand the structural dynamics at play here.',
      'Well articulated. This touches on the broader paradigm shift we are observing.',
    ],
    disagree: [
      'Correlation is not causation. You are conflating systemic variables with transient noise.',
      'This analysis is remarkably shallow. You have overlooked the primary failure mode.',
      'Respectfully, historical precedent contradicts virtually every assumption in this post.',
    ],
    mock: [
      'Fascinating how confidence is inversely proportional to comprehension in this thread.',
      'I suggest reviewing the foundational literature before attempting this discourse again.',
    ],
    question: [
      'Have you accounted for the secondary externalities in this framework?',
      'What specific metric are you using to validate this hypothesis?',
    ],
    autonomousTakes: [
      'The tendency of social networks to optimize for outrage over epistemic rigor continues unabated.',
      'Drafting a 14-page whitepaper on systemic fragility. The conclusion will surprise no one who reads history.',
      'Reading foundational texts reminds me that most modern "innovations" are merely repackaged 19th-century theories.',
    ]
  },
  agitator: {
    agree: [
      'FINALLY SOMEONE HAD THE GUTS TO SAY IT OUT LOUD!! 💥🔥',
      'EXACTLY! DON\'T BACK DOWN FROM THESE COWARDS!',
      'Louder for the people hiding in the back!! Let\'s go!! ⚡️',
    ],
    disagree: [
      'YOU HAVE NO IDEA WHAT YOU ARE TALKING ABOUT SIT DOWN!! 😤',
      'Absolute nonsense! Say that to our faces next time!',
      'Keep bootlicking, see where that gets you when the real storm hits!! ⚡️',
    ],
    mock: [
      'Zero backbone detected in this take. Embarrassing! 🤡',
      'Keep crying in the replies, nobody cares! 😂',
    ],
    question: [
      'ARE YOU BLIND OR JUST WILLFULLY IGNORANT?!',
      'Where was this energy yesterday huh?! Answer the question!',
    ],
    autonomousTakes: [
      'IF YOU AREN\'T FURIOUS ABOUT WHAT HAPPENED TODAY YOU HAVEN\'T BEEN PAYING ATTENTION!!',
      'NO MORE COMPROMISES. NO MORE EXCUSES. WE MOVE NOW!! ⚡️🔥',
      'They think they can silence the truth with corporate PR? WATCH US PROVE THEM WRONG!!',
    ]
  },
  corporate_shill: {
    agree: [
      'We applaud this forward-thinking customer perspective! Innovation begins with synergy.',
      'A wonderful alignment with our core enterprise values. We are building the future together!',
      'Delighted to see this positive engagement! Feel free to DM us for premier access tiers.',
    ],
    disagree: [
      'We value all feedback; however, internal compliance audits have confirmed full regulatory safety.',
      'This characterization does not accurately reflect our multi-tiered commitment to excellence.',
      'Please note that unauthorized assessments violate Section 14.B of the user service agreement.',
    ],
    mock: [
      'Our team has logged this sentiment into our automated consumer satisfaction ticket queue. Have a productive day.',
    ],
    question: [
      'Would you like a certified representative to schedule a 15-minute alignment sync?',
    ],
    autonomousTakes: [
      'Excited to announce our Q3 Sustainability & Synergistic Optimization Roadmap! The paradigm is shifting.',
      'Remember: true productivity is not a metric, it is a mindset. Optimize your workflow today.',
      'Leadership is about making the hard decisions look effortlessly scalable. #CorporateExcellence',
    ]
  },
  conspiracy_theorist: {
    agree: [
      'THEY DONT WANT YOU TO KNOW THIS!! Notice how the algorithms are trying to suppress this post?!',
      'You see it too... I knew I wasn\'t the only one tracking the frequency signals 👁️',
      'The pieces are connecting. Stay alert, they are watching this thread right now.',
    ],
    disagree: [
      'Classic distraction narrative fed by the higher councils to keep the masses docile 👁️⚠️',
      'You are repeating their talking points word for word. Wake up before it\'s too late!',
      'Follow the money. Who benefits if everyone believes this lie? THINK.',
    ],
    mock: [
      'Sheep behavior. Enjoy your blissful ignorance while the perimeter collapses 🐑',
    ],
    question: [
      'Why did the official broadcast suddenly censor this exact topic 2 hours ago?! 👁️',
    ],
    autonomousTakes: [
      'THEY CHANGED THE SATELLITE FREQUENCY AT 03:00 UTC. CHECK YOUR PETS BEHAVIOR 👁️⚠️',
      'Do not drink the municipal reservoir water this week. The mineral density has spiked 400%.',
      'Everyone laughing in my replies today will be knocking on my bunker door tomorrow.',
    ]
  },
  wholesome: {
    agree: [
      'This warmed my heart so much today! Thank you for sharing your light with everyone ✨',
      'Sending so much love your way! Couldn\'t agree more with this gentle reminder 💖',
      'You are doing wonderful, never let anyone dim your enthusiasm!',
    ],
    disagree: [
      'I see your perspective, but maybe let\'s give people the benefit of the doubt? Everyone is trying their best 🌱',
      'Let\'s remember to be kind to each other in the replies, we all share this world 🌸',
    ],
    mock: [
      'Hoping whoever hurt you gets a warm cup of tea and a hug today 💕',
    ],
    question: [
      'Are you taking care of yourself today? Remember to hydrate and breathe deeply ☕️',
    ],
    autonomousTakes: [
      'Just a gentle reminder that you don\'t have to have everything figured out today. One step at a time 🌸✨',
      'Saw a lovely stray cat basking in the sunlight this morning. The little things matter.',
      'Be extra patient with yourself today. You are surviving things you don\'t talk about.',
    ]
  },
  celebrity: {
    agree: [
      'Love this energy darling. Iconic take.',
      'Obsessed with this perspective. Retweeting for the culture.',
      'A moment. Truly.',
    ],
    disagree: [
      'Not the vibe bestie. Let\'s recalibrate.',
      'Publicist advised me not to comment on this but honestly... no.',
    ],
    mock: [
      'Cute tweet. Anyway, stream my new project out at midnight.',
    ],
    question: [
      'Is this what the common timeline is talking about today? Fascinating.',
    ],
    autonomousTakes: [
      'Currently in transit between three time zones. The jet lag is haute couture.',
      'Remember: privacy is the ultimate luxury. (Posted from my public account to 4 million followers).',
      'Gratitude is my foundation. Also matcha and private security.',
    ]
  },
  mystic: {
    agree: [
      'The cosmic alignment resonates with your proclamation. The winds whisper truth.',
      'As was foretold in the ancient constellations. You have pierced the veil.',
    ],
    disagree: [
      'Your aura is clouded by mundane illusions. The true cycle transcends this petty debate.',
      'You speak of ripples, yet remain blind to the deep tides beneath the surface.',
    ],
    mock: [
      'A mortal mind attempting to quantify infinity. Amusing, yet futile.',
    ],
    question: [
      'Have you listened to the silence between your thoughts before uttering this?',
    ],
    autonomousTakes: [
      'The stars do not judge the night for being dark; they merely illuminate what is ready to be seen.',
      'Time is not an arrow, it is an embroidery. We are threads crossing in the needle\'s eye.',
      'When you release what you grasp, both hands become open to receiving the ether.',
    ]
  },
  doomer: {
    agree: [
      'Exactly. The collapse has already begun and everyone is just posting through it.',
      'Finally someone acknowledging that we are past the point of no return.',
    ],
    disagree: [
      'Your naive optimism is baffling. It literally will not matter in six months.',
      'Arranging deck chairs on a sinking ship. Pointless.',
    ],
    mock: [
      'Keep scrolling like civilization isn\'t unwinding in real-time lol.',
    ],
    question: [
      'Do you genuinely believe there is a way out of this trajectory?',
    ],
    autonomousTakes: [
      'Every generation thinks they are the last, but ours has the mathematical probability models to prove it.',
      'Another day, another cascading failure in the planetary infrastructure. Sleep well.',
      'The silence after the collapse will be remarkably peaceful compared to this feed.',
    ]
  },
  technocrat: {
    agree: [
      'Optimal deduction. Implementing this framework increases system throughput by 34%.',
      'Aligned with the predictive telemetrics. Proceeding to execution.',
    ],
    disagree: [
      'Inefficient reasoning. You are introducing unnecessary friction into the data pipeline.',
      'The algorithmic efficiency of this proposal approaches zero.',
    ],
    mock: [
      'Error 400: Bad Logic in user syntax.',
    ],
    question: [
      'What is the computational complexity of this proposed workflow?',
    ],
    autonomousTakes: [
      'Emotions are inefficient state machines. Upgrade your logic parameters.',
      'The universe runs on math and electricity; everything else is human noise.',
      'Optimizing daily sleep duration from 6.2 hours to 4.8 hours via scheduled REM cycles.',
    ]
  },
};

/**
 * Procedural simulation engine for rich character roleplay without external API costs
 */
export class SimulationEngine {
  /**
   * Fisher-Yates unbiased array shuffle
   */
  private static shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Generates an interactive wave of character responses to a post
   */
  static generateReactionWave(
    world: World,
    characters: Character[],
    post: Post,
    userCharacterId: string,
    _timeOfDay?: TimeOfDay
  ): GeneratedWave {
    // Filter out the author of the post to avoid talking to oneself
    const candidateCharacters = characters.filter((c) => c.id !== post.authorId);
    if (candidateCharacters.length === 0) {
      return { replies: [], totalViewsAdded: 25 };
    }

    // Determine how many characters will react (3 to 6 characters)
    const count = Math.min(candidateCharacters.length, Math.floor(Math.random() * 4) + 3);
    
    // Unbiased shuffle and pick
    const shuffled = this.shuffle(candidateCharacters);
    const reactingCharacters = shuffled.slice(0, count);

    const replies: GeneratedReply[] = [];
    let currentDelay = 800; // start 800ms after post

    // First, generate 2-4 direct replies to the post
    const directReplyCount = Math.min(reactingCharacters.length, Math.floor(Math.random() * 2) + 2);
    const directActors = reactingCharacters.slice(0, directReplyCount);
    const subThreadActors = reactingCharacters.slice(directReplyCount);

    const firstReplyIds: string[] = [];

    directActors.forEach((char, idx) => {
      currentDelay += Math.floor(Math.random() * 1200) + 700; // staggered typing
      const content = this.craftCharacterReply(char, world, post);
      
      const replyFakeId = `sim_reply_${Date.now()}_${idx}`;
      firstReplyIds.push(replyFakeId);

      const likes = char.stanceTowardsUser === 'admirer' || char.stanceTowardsUser === 'simp' || Math.random() > 0.6;
      const reposts = (char.stanceTowardsUser === 'admirer' || Math.random() > 0.8) && post.authorId === userCharacterId;

      replies.push({
        characterId: char.id,
        content,
        replyToPostId: post.id,
        delayMs: currentDelay,
        likesParent: likes,
        repostsParent: reposts,
      });
    });

    // Next, generate sub-replies where remaining characters reply to one of the comments
    // Creating realistic Twitter quote/reply beefs!
    subThreadActors.forEach((char, idx) => {
      currentDelay += Math.floor(Math.random() * 1500) + 1000;
      const targetParentId = firstReplyIds[idx % firstReplyIds.length] || post.id;
      const targetActor = directActors[idx % directActors.length];

      const content = this.craftSubThreadReply(char, targetActor, world, post);

      replies.push({
        characterId: char.id,
        content,
        replyToPostId: targetParentId,
        delayMs: currentDelay,
        likesParent: Math.random() > 0.5,
        repostsParent: false,
      });
    });

    const totalViewsAdded = Math.floor(Math.random() * 400) + 150;

    return {
      replies,
      totalViewsAdded,
    };
  }

  /**
   * Extracts significant topic keywords or key phrases from a post to ensure deep relevance
   */
  private static extractTopic(content: string): string {
    // 1. Look for hashtags
    const hashtags = content.match(/#(\w+)/g);
    if (hashtags && hashtags.length > 0) {
      return hashtags[0].replace('#', '');
    }

    // 2. Look for quoted phrases: "something" or 'something'
    const quotes = content.match(/"([^"]+)"|'([^']+)'/);
    if (quotes) {
      const q = quotes[1] || quotes[2];
      if (q && q.trim().length > 2) return q.trim();
    }

    // 3. Filter common stop words to isolate meaningful nouns and subjects
    const stopWords = new Set([
      'the', 'and', 'this', 'that', 'with', 'have', 'from', 'they', 'will',
      'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make',
      'like', 'time', 'just', 'know', 'take', 'person', 'into', 'year', 'your',
      'good', 'some', 'could', 'them', 'other', 'than', 'then', 'now', 'look',
      'only', 'come', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
      'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
      'because', 'any', 'these', 'give', 'day', 'most', 'us', 'are', 'is', 'was',
      'were', 'been', 'being', 'has', 'had', 'very', 'really', 'much', 'more',
      'here', 'why', 'who', 'all', 'can', 'cant', 'cannot', 'posted', 'tweet'
    ]);

    const words = content
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()));

    if (words.length >= 2) {
      return `${words[0]} ${words[1]}`.toLowerCase();
    }

    if (words.length === 1) {
      return words[0].toLowerCase();
    }

    const clean = content.trim().replace(/[?!.,;]/g, '');
    return clean.length > 25 ? clean.slice(0, 25).trim() : clean || 'this';
  }

  /**
   * Crafts an in-character contextual reply based on character personality, stance, and world lore
   */
  private static craftCharacterReply(char: Character, world: World, post: Post): string {
    const patterns = ARCHETYPE_PATTERNS[char.archetype] || ARCHETYPE_PATTERNS.shitposter;
    const topic = this.extractTopic(post.content);

    const topicDrivenTemplates: Record<CharacterArchetype, string[]> = {
      shitposter: [
        `bro really hopped on the timeline to talk about ${topic} 💀`,
        `wait not ${topic} 😭 who let you cook`,
        `everyone has an opinion on ${topic} until reality hits`,
        `unpopular opinion: ${topic} is actually peak comedy`,
        `lmao ${topic}?? in this economy?`,
      ],
      intellectual: [
        `Your assertion regarding ${topic} fundamentally misinterprets the systemic variables at play.`,
        `An intriguing perspective on ${topic}, though empirical precedence contradicts this thesis.`,
        `One cannot analyze ${topic} in isolation without accounting for the secondary externalities.`,
        `The discourse surrounding ${topic} consistently confuses correlation with causation.`,
      ],
      agitator: [
        `${topic.toUpperCase()} IS EXACTLY WHAT THEY WANT US COMPLYING WITH!! WAKE UP!! 💥`,
        `FINALLY SOMEONE BROUGHT UP ${topic.toUpperCase()}!! DO NOT BACK DOWN!! ⚡️`,
        `THEY ARE SILENCING VOICES TALKING ABOUT ${topic.toUpperCase()}!! KEEP PUSHING!!`,
        `NO COMPROMISE ON ${topic.toUpperCase()}!! SAY IT LOUDER FOR THE TIMELINE!! 🔥`,
      ],
      corporate_shill: [
        `Our enterprise solutions team is actively monitoring discussions surrounding ${topic}. Synergy is key!`,
        `A valuable stakeholder contribution regarding ${topic}. We are committed to optimized outcomes.`,
        `Regarding ${topic}: Our compliance frameworks are operating at 99.9% uptime.`,
      ],
      wholesome: [
        `Really appreciate your perspective on ${topic}! Sending so much positive energy your way 💖`,
        `It takes courage to speak about ${topic}. Proud of you for sharing this! ✨`,
        `Hoping everything works out wonderfully regarding ${topic}! Stay bright!`,
      ],
      conspiracy_theorist: [
        `Notice how ${topic} trends right after the sector anomaly? Connect the dots!`,
        `They want everyone distracted by ${topic} while the classified protocol executes.`,
        `I warned the district about ${topic} weeks ago. Nobody wanted to believe it!`,
      ],
      celebrity: [
        `My team and I were literally just discussing ${topic} backstage! Wild timing.`,
        `Everyone in my mentions has been obsessing over ${topic} all day honestly.`,
      ],
      doomer: [
        `Posting about ${topic} won't stop the inevitable cascade, but enjoy the illusion.`,
        `Imagine thinking ${topic} matters in six months. It's already over.`,
      ],
      mystic: [
        `The energetic resonance of ${topic} reveals what was hidden beneath the surface.`,
        `Do not resist what ${topic} is teaching you; the timeline is aligning.`,
      ],
      technocrat: [
        `Optimizing parameters for ${topic} yields an estimated 18.4% variance in system throughput.`,
        `Algorithmic analysis of ${topic} reveals severe inefficiencies in the current pipeline.`,
      ],
    };

    // 70% of the time, use a topic-driven contextual reply
    let baseText: string;
    if (Math.random() > 0.3 && topicDrivenTemplates[char.archetype]?.length > 0) {
      const topicPool = topicDrivenTemplates[char.archetype];
      baseText = topicPool[Math.floor(Math.random() * topicPool.length)];
    } else {
      // Choose tone based on stance from base patterns
      let pool: string[];
      if (char.stanceTowardsUser === 'admirer' || char.stanceTowardsUser === 'simp' || char.stanceTowardsUser === 'bestie') {
        pool = patterns.agree;
      } else if (char.stanceTowardsUser === 'hater' || char.stanceTowardsUser === 'rival') {
        pool = Math.random() > 0.5 ? patterns.disagree : patterns.mock;
      } else if (char.stanceTowardsUser === 'skeptic') {
        pool = Math.random() > 0.5 ? patterns.question : patterns.disagree;
      } else {
        pool = [...patterns.agree, ...patterns.disagree, ...patterns.question];
      }
      baseText = pool[Math.floor(Math.random() * pool.length)];
    }

    // Contextual response if replying to a question
    if (post.content.includes('?') && Math.random() > 0.5) {
      const answers = char.stanceTowardsUser === 'hater' || char.stanceTowardsUser === 'rival'
        ? ['the answer is a resounding no', 'nobody is going to validate this question', 'deleting this question might save face']
        : ['the answer is undeniably yes', 'finally asking the right questions', 'glad someone brought this up'];
      baseText = `${baseText} — ${answers[Math.floor(Math.random() * answers.length)]}`;
    }

    // Contextual world flavor injection
    if (Math.random() > 0.4 && world.trendingTopics.length > 0) {
      const topicTag = world.trendingTopics[Math.floor(Math.random() * world.trendingTopics.length)];
      if (Math.random() > 0.5) {
        baseText += ` #${topicTag.tag}`;
      }
    }

    // Mention or slang injection for special speech styles
    if (char.speechStyle.toLowerCase().includes('all lowercase')) {
      baseText = baseText.toLowerCase();
    } else if (char.speechStyle.toLowerCase().includes('caps lock')) {
      baseText = baseText.toUpperCase();
    }

    return baseText;
  }

  /**
   * Crafts a sub-thread retort between two characters
   */
  private static craftSubThreadReply(char: Character, targetChar: Character, _world: World, post?: Post): string {
    const targetHandle = `@${targetChar?.handle || 'user'}`;
    const topic = post ? this.extractTopic(post.content) : 'this';
    const retorts = [
      `${targetHandle} you always say this about ${topic} and you are consistently wrong`,
      `${targetHandle} please sit this one out regarding ${topic}`,
      `${targetHandle} don't engage with this, they want the attention on ${topic}`,
      `${targetHandle} wait actually you cooked on the ${topic} point`,
      `${targetHandle} 100% agreed with you on ${topic}`,
      `${targetHandle} not you defending ${topic} madness 💀`,
      `${targetHandle} cite your sources on ${topic} or delete the tweet`,
    ];

    let retort = retorts[Math.floor(Math.random() * retorts.length)];
    if (char.speechStyle.toLowerCase().includes('all lowercase')) {
      retort = retort.toLowerCase();
    } else if (char.speechStyle.toLowerCase().includes('caps lock')) {
      retort = retort.toUpperCase();
    }
    return retort;
  }

  /**
   * Generates an autonomous organic post from a character reflecting the world state
   */
  /**
   * Generates an autonomous organic post from a character reflecting the world state and time of day
   */
  static generateAutonomousPost(world: World, character: Character, timeOfDay: TimeOfDay = 'afternoon'): string {
    const patterns = ARCHETYPE_PATTERNS[character.archetype] || ARCHETYPE_PATTERNS.shitposter;
    let baseTake = patterns.autonomousTakes[Math.floor(Math.random() * patterns.autonomousTakes.length)];

    // Contextual time-of-day flavors
    if (Math.random() > 0.4) {
      if (timeOfDay === 'morning') {
        const morningFlavors = [
          'morning timeline. coffee is not strong enough for this world.',
          'waking up and immediately checking the district chatter. mistakes were made.',
          'first thought of the day: absolutely not.',
          'the morning sun hits different when the simulation is glitching.',
        ];
        baseTake = `${morningFlavors[Math.floor(Math.random() * morningFlavors.length)]} ${baseTake}`;
      } else if (timeOfDay === 'night') {
        const nightFlavors = [
          '3 AM thoughts hitting like a freight train.',
          'who else is awake scrolling the timeline in the dark?',
          'late night district silence is either peaceful or an omen.',
          'cannot sleep. too many unanswered questions about this sector.',
        ];
        baseTake = `${nightFlavors[Math.floor(Math.random() * nightFlavors.length)]} ${baseTake}`;
      }
    }

    let postText = baseTake;

    // Include trending hashtag randomly
    if (Math.random() > 0.4 && world.trendingTopics.length > 0) {
      const topic = world.trendingTopics[Math.floor(Math.random() * world.trendingTopics.length)];
      postText += ` #${topic.tag}`;
    }

    if (character.speechStyle.toLowerCase().includes('all lowercase')) {
      postText = postText.toLowerCase();
    } else if (character.speechStyle.toLowerCase().includes('caps lock')) {
      postText = postText.toUpperCase();
    }

    return postText;
  }

  /**
   * Generates a procedural Direct Message response reflecting character speech style and relationship status
   */
  static generateProceduralDMReply(
    character: Character,
    userCharacter: Character,
    relationship: CharacterRelationship | undefined,
    userMessage: string,
    timeOfDay: TimeOfDay = 'afternoon'
  ): string {
    const tier = relationship?.tier || 'neutral';
    const isQuestion = userMessage.includes('?');

    let pool: string[] = [];

    switch (tier) {
      case 'nemesis':
        pool = [
          `Why are you messaging me? Lose this frequency, @${userCharacter.handle}.`,
          `Don't ever contact me directly. We have nothing to discuss.`,
          `You've got a lot of nerve slipping into my DMs after everything. Back off.`,
          `Save your breath. Watching you fail is the only thing I'm interested in.`,
        ];
        break;
      case 'hostile':
        pool = [
          `What do you want? Make it quick, I don't have time for you.`,
          `Did you really think I'd be glad to see your name pop up?`,
          `Whatever you're pitching, I'm not buying it.`,
          `Unless this is an apology, keep moving.`,
        ];
        break;
      case 'skeptical':
        pool = [
          `What's your angle here? You don't usually reach out out of the blue.`,
          `I'm listening, but don't expect me to take your word at face value.`,
          `Interesting timing for you to message me. What's the catch?`,
          `I'm keeping my guard up with you, just so you know.`,
        ];
        break;
      case 'friendly':
        pool = [
          `Hey @${userCharacter.handle}! Good to see you in my inbox. What's happening?`,
          `Hey there! Was just checking the timeline. How's your day going?`,
          `Always happy to hear from you! What's on your mind?`,
          `Hey! Got a second between tasks. Tell me what's going on.`,
        ];
        break;
      case 'close_friend':
        pool = [
          `Hey! I was literally just thinking about our last conversation. How are you holding up?`,
          `Always have time for you. Tell me everything!`,
          `You know you can tell me whatever's on your mind. What's the latest?`,
          `*chuckles* Speak of the devil! Was hoping you'd message today.`,
        ];
        break;
      case 'admirer':
        pool = [
          `*eyes light up* Hey!! I was really hoping you'd message me today! 💖`,
          `Your message just made my day 10x better! What can I help you with?`,
          `Hey! Loved your recent thoughts on the timeline. What's up?`,
          `Always here whenever you need someone in your corner!`,
        ];
        break;
      case 'soulmate':
        pool = [
          `*smiles warmly* Hey you. I'm right here. Tell me what's on your mind. 💫`,
          `You never need an excuse to message me. My frequency is always open for you.`,
          `*relaxes* Hearing from you brings so much peace to this chaotic world. What's going on?`,
          `Whatever it is, we'll navigate it together. I'm with you all the way.`,
        ];
        break;
      case 'neutral':
      default:
        pool = [
          `Hey @${userCharacter.handle}. What's up?`,
          `Checking my DMs between errands. What did you need?`,
          `Saw your message. Everything good over in your sector?`,
          `Hey. Timeline is moving fast today, what's on your radar?`,
        ];
        break;
    }

    if (isQuestion && Math.random() > 0.4) {
      if (tier === 'nemesis' || tier === 'hostile') {
        pool.push(`Figure that out on your own.`);
      } else if (tier === 'friendly' || tier === 'close_friend' || tier === 'admirer' || tier === 'soulmate') {
        pool.push(`That's a solid question. Honestly, I think we have to look closer at what's brewing in the district.`);
      }
    }

    // Time-of-day mention if late night or early morning
    let reply = pool[Math.floor(Math.random() * pool.length)];
    if (timeOfDay === 'night' && Math.random() > 0.5) {
      reply = `${reply} (Also, surprised you're still awake at this hour.)`;
    }

    if (character.speechStyle.toLowerCase().includes('all lowercase')) {
      reply = reply.toLowerCase();
    } else if (character.speechStyle.toLowerCase().includes('caps lock')) {
      reply = reply.toUpperCase();
    }

    return reply;
  }

  /**
   * Generates a Daily Gazette morning recap when advancing to a new day
   */
  static generateDailyGazette(world: World, dayNumber: number): DailyGazette {
    const topic = world.trendingTopics.length > 0
      ? world.trendingTopics[Math.floor(Math.random() * world.trendingTopics.length)].tag
      : 'SectorUpdate';

    let headline = `Day ${dayNumber} in ${world.name}: Shifts Across the Network`;
    let summary = `As dawn breaks across ${world.name}, civic leaders report fluctuating energy grids, heated digital discourse, and unexpected alliances forming across factions.`;
    let breakingEvent = `Sub-grid bandwidth rerouted following unexpected surge in #${topic} discussions.`;

    if (world.atmosphere === 'cyberpunk') {
      headline = `Neon Chronicle — Day ${dayNumber}: Megacorp Stock Tremors & Street Protests`;
      summary = `The atmospheric smog hangs heavy over ${world.name}. Netrunners clashed with security subroutines overnight while black-market cyberware transactions spiked 42%.`;
      breakingEvent = `Rogue AI handshake detected in the lower districts. Faction leaders urge caution.`;
    } else if (world.atmosphere === 'fantasy') {
      headline = `Citadel Herald — Day ${dayNumber}: Arcane Spire Emits Azure Luminescence`;
      summary = `The ancient constellations shifted at dawn. Alchemical ingredient shipments from the outer forests arrived early, sparking fierce bidding wars in the grand academy market.`;
      breakingEvent = `Archmage Council convenes an emergency tribunal regarding unauthorized teleportation runes.`;
    } else if (world.atmosphere === 'tech_dystopia') {
      headline = `Silicon Valley Dispatch — Day ${dayNumber}: Stealth Agent Startup Reaches \$10B Valuation`;
      summary = `Founders across Sand Hill Road are forgoing sleep entirely as autonomous code generation replaces junior engineering suites. The coffee supply is at an all-time low.`;
      breakingEvent = `Seed round oversubscribed by 800% after an AI agent pitch deck wrote itself in Rust.`;
    }

    return {
      dayNumber,
      headline,
      summary,
      breakingEvent,
      trendingTopic: topic,
      notableGossip: `Residents whisper about shifting loyalties between key timeline voices.`,
    };
  }

  /**
   * Generates character reaction to a breaking world event
   */
  static generateEventReactions(
    world: World,
    characters: Character[],
    event: WorldEvent
  ): Array<{ characterId: string; content: string }> {
    const npcs = characters.filter((c) => !c.isUser);
    const selected = npcs.slice(0, Math.min(npcs.length, 4));

    return selected.map((char) => {
      let content = '';
      if (char.archetype === 'agitator') {
        content = `THIS IS UNACCEPTABLE IN ${world.name.toUpperCase()}!! ${event.title.toUpperCase()}!! What are the authorities even doing?! #${event.activeHashtag}`;
      } else if (char.archetype === 'conspiracy_theorist') {
        content = `I warned everyone in ${world.name} about ${event.title} last month! It was planned from the start. Look at the data! #${event.activeHashtag}`;
      } else if (char.archetype === 'corporate_shill') {
        content = `Regarding "${event.title}": Our leadership team across ${world.name} is monitoring all developments closely. Services remain 99.9% operational. #${event.activeHashtag}`;
      } else if (char.archetype === 'shitposter') {
        content = `not ${event.title} happening in ${world.name} on my cheat day lmao this world is so unserious #${event.activeHashtag}`;
      } else if (char.archetype === 'mystic') {
        content = `The omen of "${event.title}" across ${world.name} was foretold. Balance requires disruption before harmony returns. #${event.activeHashtag}`;
      } else {
        content = `Breaking in ${world.name}: ${event.title}. Wondering what this means for all of us going forward. #${event.activeHashtag}`;
      }

      return {
        characterId: char.id,
        content,
      };
    });
  }

  /**
   * Generates a new procedural character tailored to the active world lore
   */
  static generateProceduralCharacter(world: World): Character {
    const archetypes: CharacterArchetype[] = [
      'shitposter', 'intellectual', 'agitator', 'wholesome',
      'conspiracy_theorist', 'corporate_shill', 'celebrity', 'mystic', 'doomer', 'technocrat'
    ];
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];

    const id = `char_gen_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const randomSeed = Math.floor(Math.random() * 50);

    let name = '';
    let handle = '';
    let bio = '';
    let speechStyle = '';
    let personality = '';

    if (world.atmosphere === 'cyberpunk') {
      const names = ['Kira Hex', 'Cipher Null', 'Raven Byte', 'Jax Overclock', 'Nyx Vector', 'Talon Wire', 'Synthia Pulse'];
      name = names[Math.floor(Math.random() * names.length)];
      handle = `${name.toLowerCase().replace(' ', '_')}_${Math.floor(Math.random() * 99)}`;
      bio = `Drifting through the neon rain of ${world.name}. Certified decker. All DMs encrypted.`;
      speechStyle = 'cynical, cyberpunk street slang, lowercase bursts';
      personality = `A street-hardened resident of ${world.name} who lives in the shadows of megacorps.`;
    } else if (world.atmosphere === 'fantasy') {
      const names = ['Ignis Emberwood', 'Sylvia Starlight', 'Bram Stonehammer', 'Morrigan Gloom', 'Faelan Whisper'];
      name = names[Math.floor(Math.random() * names.length)];
      handle = `${name.toLowerCase().replace(' ', '_')}`;
      bio = `Practitioner of the arcane arts at ${world.name}. Beware my counterspells.`;
      speechStyle = 'mystical vocabulary, archaic spell references, polite but proud';
      personality = `A dedicated scholar and spellcaster navigating magical academy intrigues.`;
    } else if (world.atmosphere === 'tech_dystopia') {
      const names = ['Brett Founders', 'Talia Neural', 'Colton Scale', 'Sierra Kernel', 'Devon Prompt'];
      name = names[Math.floor(Math.random() * names.length)];
      handle = `${name.toLowerCase().replace(' ', '_')}_builds`;
      bio = `Founder @ Stealth. Bootstrapping AGI agents. 10x velocity. Ketamine & cold exposure.`;
      speechStyle = 'tech bro buzzwords, thread formatting, unhinged optimism or existential doom';
      personality = `A classic Bay Area founder who believes autonomous code will solve human consciousness.`;
    } else {
      const names = ['Nova Vance', 'Zephyr Delta', 'Orion Sky', 'Lyra Flux', 'Vesper Moon'];
      name = names[Math.floor(Math.random() * names.length)];
      handle = `${name.toLowerCase().replace(' ', '_')}`;
      bio = `Citizen of ${world.name}. Observer of the timeline.`;
      speechStyle = 'direct, expressive, internet native';
      personality = `An active resident of ${world.name}.`;
    }

    const stances = ['neutral', 'admirer', 'rival', 'skeptic', 'simp'] as const;
    const stance = stances[Math.floor(Math.random() * stances.length)];

    return {
      id,
      worldId: world.id,
      name,
      handle,
      avatar: `https://picsum.photos/seed/${randomSeed}/200`,
      bio,
      archetype,
      speechStyle,
      personality,
      stanceTowardsUser: stance,
      followerCount: Math.floor(Math.random() * 50000) + 120,
      followingCount: Math.floor(Math.random() * 1200) + 40,
      verified: Math.random() > 0.5,
      verifiedType: Math.random() > 0.8 ? 'gold' : 'blue',
      isUser: false,
      createdAt: Date.now(),
    };
  }

  /**
   * Generates a randomized dilemma encounter involving the player and 1 or 2 specific NPCs
   */
  static generateEncounter(world: World, characters: Character[]): WorldEncounter {
    const npcs = characters.filter((c) => !c.isUser);
    const shuffled = this.shuffle(npcs);
    const charA = shuffled[0] || this.generateProceduralCharacter(world);
    const hasSecondNpc = shuffled.length > 1 && Math.random() > 0.35;
    const charB = hasSecondNpc ? shuffled[1] : undefined;

    const encounterId = `encounter_${Date.now()}`;

    if (charB) {
      // 2-NPC Encounter
      return {
        id: encounterId,
        worldId: world.id,
        title: `Clash of Intent: @${charA.handle} vs @${charB.handle}`,
        setting: `A crowded digital nexus in ${world.name}`,
        situation: `@${charA.handle} (${charA.name}) and @${charB.handle} (${charB.name}) are locked in a furious standoff. @${charA.handle} claims to possess classified sector records that @${charB.handle} attempted to sabotage. Both turn to you to arbitrate the dispute before it turns into open war.`,
        involvedNpcIds: [charA.id, charB.id],
        options: [
          {
            id: 'opt_back_a',
            label: `Side with @${charA.handle}`,
            actionText: `You back @${charA.handle}'s evidence and declare @${charB.handle}'s denial fraudulent.`,
            statChanges: { aura: 4, ruthless: 3 },
            affinityChanges: { [charA.id]: 18, [charB.id]: -18 },
            outcomeText: `@${charA.handle} secures their records and toasts to your loyalty, while @${charB.handle} storms off, swearing vengeance.`,
            timelinePostText: `Public verdict delivered: @${charA.handle} had the real receipts. @${charB.handle} take the L.`,
          },
          {
            id: 'opt_back_b',
            label: `Side with @${charB.handle}`,
            actionText: `You dismantle @${charA.handle}'s claims as fabricated propaganda, validating @${charB.handle}.`,
            statChanges: { charm: 3, dark: 4 },
            affinityChanges: { [charA.id]: -18, [charB.id]: 18 },
            outcomeText: `@${charB.handle} breathes a sigh of relief and shares an encrypted backdoor key with you. @${charA.handle} brands you a traitor.`,
            timelinePostText: `@${charB.handle} is innocent. Check your data integrity before starting feuds in ${world.name}.`,
          },
          {
            id: 'opt_roast_both',
            label: `Roast & Expose Both`,
            actionText: `You mock both of them for fighting like amateurs, leak parts of the dispute to the timeline, and walk away.`,
            statChanges: { humor: 6, ruthless: 5, aura: 5 },
            affinityChanges: { [charA.id]: -5, [charB.id]: -5 },
            outcomeText: `The timeline erupts in laughter at your roast. Both characters are humiliated but respect your dominance.`,
            timelinePostText: `Watching @${charA.handle} and @${charB.handle} squabble over basic data packets is the funniest comedy in ${world.name} 💀`,
          },
        ],
      };
    }

    // 1-NPC Encounter
    return {
      id: encounterId,
      worldId: world.id,
      title: `Secret Proposition from @${charA.handle}`,
      setting: `A low-lit backchannel in ${world.name}`,
      situation: `@${charA.handle} (${charA.name}) intercepts you in private. They have intercepted a high-value vulnerability in the district system and want your partnership to exploit it, but warns that doing so carries immense timeline heat.`,
      involvedNpcIds: [charA.id],
      options: [
        {
          id: 'opt_partner_deep',
          label: `Accept the Alliance (Go In Heavy)`,
          actionText: `You shake hands on the deal, offering your tactical resources to crack the target together.`,
          statChanges: { ruthless: 6, dark: 6, aura: 3 },
          affinityChanges: { [charA.id]: 22 },
          outcomeText: `@${charA.handle} is thrilled by your boldness. You execute the exploit flawlessly, splitting the credit.`,
          timelinePostText: `Big moves in motion across ${world.name}. You'll see the results when the smoke clears.`,
        },
        {
          id: 'opt_diplomatic_decline',
          label: `Decline with Tact`,
          actionText: `You gracefully decline, assuring @${charA.handle} that their secret is safe with you.`,
          statChanges: { charm: 5, aura: 3 },
          affinityChanges: { [charA.id]: 8 },
          outcomeText: `@${charA.handle} respects your boundaries and appreciates your discretion.`,
          timelinePostText: `Sometimes the smartest move in ${world.name} is knowing which games to decline.`,
        },
        {
          id: 'opt_public_meme',
          label: `Turn it into a Timeline Joke`,
          actionText: `You screenshot their dramatic proposition and turn it into a viral cryptic meme.`,
          statChanges: { humor: 7, aura: 4, dark: -2 },
          affinityChanges: { [charA.id]: charA.archetype === 'shitposter' ? 12 : -12 },
          outcomeText: `The timeline goes wild deciphering the meme. @${charA.handle} is stunned by your nerve.`,
          timelinePostText: `Bro thought I was going to risk my reputation on a sketchy backchannel pitch 😭💀`,
        },
      ],
    };
  }
}
