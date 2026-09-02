import { World, WorldEvent } from '../types/world';
import { Character, CharacterArchetype } from '../types/character';
import { Post } from '../types/post';
import { GeneratedReply, GeneratedWave } from '../types/ai';

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
   * Generates an interactive wave of character responses to a post
   */
  static generateReactionWave(
    world: World,
    characters: Character[],
    post: Post,
    userCharacterId: string
  ): GeneratedWave {
    // Filter out the author of the post to avoid talking to oneself
    const candidateCharacters = characters.filter((c) => c.id !== post.authorId);
    if (candidateCharacters.length === 0) {
      return { replies: [], totalViewsAdded: 25 };
    }

    // Determine how many characters will react (3 to 6 characters)
    const count = Math.min(candidateCharacters.length, Math.floor(Math.random() * 4) + 3);
    
    // Shuffle and pick
    const shuffled = [...candidateCharacters].sort(() => 0.5 - Math.random());
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

      const content = this.craftSubThreadReply(char, targetActor, world);

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
   * Crafts an in-character contextual reply based on character personality, stance, and world lore
   */
  private static craftCharacterReply(char: Character, world: World, post: Post): string {
    const patterns = ARCHETYPE_PATTERNS[char.archetype] || ARCHETYPE_PATTERNS.shitposter;
    
    // Choose tone based on stance
    let pool: string[];
    if (char.stanceTowardsUser === 'admirer' || char.stanceTowardsUser === 'simp' || char.stanceTowardsUser === 'bestie') {
      pool = patterns.agree;
    } else if (char.stanceTowardsUser === 'hater' || char.stanceTowardsUser === 'rival') {
      pool = Math.random() > 0.5 ? patterns.disagree : patterns.mock;
    } else if (char.stanceTowardsUser === 'skeptic') {
      pool = Math.random() > 0.5 ? patterns.question : patterns.disagree;
    } else {
      // Neutral - mix
      pool = [...patterns.agree, ...patterns.disagree, ...patterns.question];
    }

    let baseText = pool[Math.floor(Math.random() * pool.length)];

    // Contextual response if replying to a question
    if (post.content.includes('?') && Math.random() > 0.5) {
      const answers = char.stanceTowardsUser === 'hater' || char.stanceTowardsUser === 'rival'
        ? ['the answer is a resounding no', 'nobody is going to validate this question', 'deleting this question might save face']
        : ['the answer is undeniably yes', 'finally asking the right questions', 'glad someone brought this up'];
      baseText = `${baseText} — ${answers[Math.floor(Math.random() * answers.length)]}`;
    }

    // Contextual world flavor injection
    if (Math.random() > 0.4 && world.trendingTopics.length > 0) {
      const topic = world.trendingTopics[Math.floor(Math.random() * world.trendingTopics.length)];
      if (Math.random() > 0.5) {
        baseText += ` #${topic.tag}`;
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
  private static craftSubThreadReply(char: Character, targetChar: Character, _world: World): string {
    const targetHandle = `@${targetChar?.handle || 'user'}`;
    const retorts = [
      `${targetHandle} you always say this and you are consistently wrong`,
      `${targetHandle} please sit this one out respectfully`,
      `${targetHandle} don't engage with this, they want the attention`,
      `${targetHandle} wait actually you cooked here`,
      `${targetHandle} 100% agreed with you on this`,
      `${targetHandle} not you defending this madness 💀`,
      `${targetHandle} cite your sources or delete the tweet`,
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
  static generateAutonomousPost(world: World, character: Character): string {
    const patterns = ARCHETYPE_PATTERNS[character.archetype] || ARCHETYPE_PATTERNS.shitposter;
    const baseTake = patterns.autonomousTakes[Math.floor(Math.random() * patterns.autonomousTakes.length)];

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
}
