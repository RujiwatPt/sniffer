import React, { useState } from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SimulationEngine } from '../../services/simulationEngine';
import { Modal } from '../common/Modal';
import { World, WorldAtmosphere } from '../../types/world';
import { Character } from '../../types/character';
import { Post } from '../../types/post';

export const WorldCreatorModal: React.FC = () => {
  const { isWorldCreatorOpen, setWorldCreatorOpen } = useSettingsStore();
  const { addWorld, setActiveWorldId } = useWorldStore();
  const { addCharacter } = useCharacterStore();
  const { addPost } = usePostStore();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [atmosphere, setAtmosphere] = useState<WorldAtmosphere>('cyberpunk');
  const [accentColor, setAccentColor] = useState('#1d9bf0');
  const [trendingTagsInput, setTrendingTagsInput] = useState('NewEra, Underground, Drama');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [autoGenerateNPCs, setAutoGenerateNPCs] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const worldId = `world_${Date.now()}`;
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const tags = trendingTagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)
      .map((tag) => ({
        tag,
        postCount: Math.floor(Math.random() * 20000) + 500,
        category: 'General',
      }));

    const newWorld: World = {
      id: worldId,
      name: name.trim(),
      handle: cleanHandle,
      tagline: tagline.trim() || `The living realm of ${name}`,
      description: description.trim() || `A newly founded simulation universe waiting for history to be written.`,
      atmosphere,
      themeAccent: accentColor,
      trendingTopics: tags.length > 0 ? tags : [{ tag: 'WelcomeToTheWorld', postCount: 1000, category: 'Launch' }],
      factions: [],
      systemPrompt: systemPrompt.trim() || `You are roleplaying in ${name}. All posts should reflect the world lore and atmosphere.`,
      createdAt: Date.now(),
    };

    addWorld(newWorld);

    // Create user persona for this new world
    const userPersona: Character = {
      id: `user_${worldId}`,
      worldId,
      name: `${name} Pioneer`,
      handle: `pioneer_${cleanHandle}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: `First citizen of ${name}. Watching the timeline unfold.`,
      archetype: 'intellectual',
      speechStyle: 'observant, direct',
      personality: `A pioneer resident in ${name}.`,
      stanceTowardsUser: 'bestie',
      followerCount: 250,
      followingCount: 40,
      verified: true,
      verifiedType: 'blue',
      isUser: true,
      createdAt: Date.now(),
    };
    addCharacter(userPersona);

    // Auto-generate NPCs if toggled
    if (autoGenerateNPCs) {
      const generatedCharacters: Character[] = [];
      for (let i = 0; i < 4; i++) {
        const npc = SimulationEngine.generateProceduralCharacter(newWorld);
        addCharacter(npc);
        generatedCharacters.push(npc);
      }

      // Add a couple starter posts from generated NPCs
      generatedCharacters.slice(0, 2).forEach((npc, idx) => {
        const starterPost: Post = {
          id: `post_init_${Date.now()}_${idx}`,
          worldId,
          authorId: npc.id,
          content: SimulationEngine.generateAutonomousPost(newWorld, npc),
          createdAt: Date.now() - (idx + 1) * 1800000,
          likesCount: Math.floor(Math.random() * 40) + 5,
          repostsCount: Math.floor(Math.random() * 10) + 1,
          repliesCount: 0,
          viewsCount: Math.floor(Math.random() * 300) + 80,
          likedBy: [],
          repostedBy: [],
          bookmarkedBy: [],
          tags: [],
        };
        addPost(starterPost);
      });
    }

    setActiveWorldId(worldId);
    setWorldCreatorOpen(false);

    // Reset fields
    setName('');
    setHandle('');
    setTagline('');
    setDescription('');
    setSystemPrompt('');
  };

  return (
    <Modal
      isOpen={isWorldCreatorOpen}
      onClose={() => setWorldCreatorOpen(false)}
      title="Create New Simulation World"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            World Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Neo-Tokyo 2099 or Hogwarts High"
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Atmosphere / Genre
            </label>
            <select
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value as WorldAtmosphere)}
              className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
            >
              <option value="cyberpunk">Cyberpunk / Sci-Fi Dystopia</option>
              <option value="fantasy">High Fantasy / Magic Academy</option>
              <option value="tech_dystopia">Silicon Valley Tech Satire</option>
              <option value="corporate">Dunder Mifflin / Corporate Chaos</option>
              <option value="sci_fi">Galactic Space Opera</option>
              <option value="chaotic_internet">Chaotic Meme Internet</option>
              <option value="custom">Custom Universe</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Theme Accent Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-9 h-9 rounded-lg bg-transparent border border-[#2f3336] cursor-pointer p-0.5"
              />
              <span className="text-xs font-mono text-[#71767b]">{accentColor}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            World Lore & Background Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the setting, societal tensions, factions, or what makes this world special..."
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            Trending Hashtags (comma separated)
          </label>
          <input
            type="text"
            value={trendingTagsInput}
            onChange={(e) => setTrendingTagsInput(e.target.value)}
            placeholder="e.g. MagicLeak, DragonDerby, DarkNet"
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            AI Prompt Guidelines (Optional)
          </label>
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. Characters use medieval royal speech or 2000s forum lingo"
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="autoGen"
            checked={autoGenerateNPCs}
            onChange={(e) => setAutoGenerateNPCs(e.target.checked)}
            className="w-4 h-4 rounded text-twitter-blue focus:ring-0 bg-[#16181c] border-[#2f3336]"
          />
          <label htmlFor="autoGen" className="text-xs text-[#e7e9ea] select-none cursor-pointer flex items-center space-x-1">
            <span>Auto-populate with 4 AI characters immediately</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </label>
        </div>

        <div className="pt-3 border-t border-[#2f3336] flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setWorldCreatorOpen(false)}
            className="px-4 py-2 border border-[#2f3336] text-[#e7e9ea] rounded-full text-xs font-semibold hover:bg-[#181818] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
          >
            <Globe className="w-4 h-4" />
            <span>Spawn World</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
