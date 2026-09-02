import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SimulationEngine } from '../../services/simulationEngine';
import { Modal } from '../common/Modal';
import { WorldEvent } from '../../types/world';
import { Post } from '../../types/post';

export const WorldEventModal: React.FC = () => {
  const { isEventTriggerOpen, setEventTriggerOpen } = useSettingsStore();
  const { getActiveWorld, triggerWorldEvent } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getCharactersByWorld } = useCharacterStore();
  const characters = getCharactersByWorld(activeWorld.id);

  const { addPost } = usePostStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [impactLevel, setImpactLevel] = useState<'breaking' | 'high' | 'medium'>('breaking');

  // Quick preset templates per world
  const quickPresets: Record<string, Array<{ title: string; hashtag: string }>> = {
    world_cyberpunk: [
      { title: 'Sector 7 Quantum Grid Overload Shuts Down Sub-levels', hashtag: 'QuantumBlackout' },
      { title: 'Aethelgard Corp CEO Caught Smuggling Rogue AI Chips', hashtag: 'AethelgardLeak' },
      { title: 'Bounty Hunter Tournament Announced in Neon Alley', hashtag: 'CyberSamurai' },
    ],
    world_tech: [
      { title: 'OpenAI Releases Autonomous Swarm that Trades Stocks', hashtag: 'AGIReached' },
      { title: 'YC Founder Caught Hosting Pitch Meeting in Cryo Chamber', hashtag: 'PitchChamber' },
      { title: 'Massive AWS Data Center Outage Knocks Out 90% of Wrappers', hashtag: 'CloudApocalypse' },
    ],
    world_fantasy: [
      { title: 'Forbidden Necromancy Grimoire Stolen From Grand Library', hashtag: 'ForbiddenTome' },
      { title: 'Inter-House Sky Derby Cancelled Due to Dragon Incursion', hashtag: 'DragonAlert' },
    ],
  };

  const currentPresets = quickPresets[activeWorld.id] || [
    { title: 'Major Global Incident Declared by Planetary Council', hashtag: 'PlanetaryNews' },
    { title: 'Unexplained Signal Detected in Regional Subnet', hashtag: 'AnomalyDetected' },
  ];

  const handleApplyPreset = (p: { title: string; hashtag: string }) => {
    setTitle(p.title);
    setHashtag(p.hashtag);
    setDescription(`Breaking developments in ${activeWorld.name} regarding this ongoing situation.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventId = `event_${Date.now()}`;
    const cleanTag = hashtag.trim().replace(/^#/, '') || 'BreakingNews';

    const event: WorldEvent = {
      id: eventId,
      worldId: activeWorld.id,
      title: title.trim(),
      description: description.trim() || title.trim(),
      impactLevel,
      timestamp: Date.now(),
      activeHashtag: cleanTag,
    };

    triggerWorldEvent(event);

    // Generate reactions from characters in the world!
    const reactions = SimulationEngine.generateEventReactions(activeWorld, characters, event);

    reactions.forEach((r, idx) => {
      setTimeout(() => {
        const post: Post = {
          id: `event_post_${Date.now()}_${idx}`,
          worldId: activeWorld.id,
          authorId: r.characterId,
          content: r.content,
          createdAt: Date.now(),
          likesCount: Math.floor(Math.random() * 45) + 10,
          repostsCount: Math.floor(Math.random() * 15) + 2,
          repliesCount: Math.floor(Math.random() * 6),
          viewsCount: Math.floor(Math.random() * 500) + 120,
          likedBy: [],
          repostedBy: [],
          bookmarkedBy: [],
          tags: [cleanTag],
        };
        addPost(post);
      }, (idx + 1) * 800);
    });

    setEventTriggerOpen(false);
    setTitle('');
    setDescription('');
    setHashtag('');
  };

  return (
    <Modal
      isOpen={isEventTriggerOpen}
      onClose={() => setEventTriggerOpen(false)}
      title="Broadcast Breaking World Event"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-[#71767b]">
          Broadcast an event into <span className="text-[#e7e9ea] font-bold">{activeWorld.name}</span>. Characters across the universe will immediately react on the timeline.
        </p>

        {/* Quick Presets */}
        <div>
          <label className="block text-[11px] font-bold text-[#71767b] uppercase tracking-wider mb-1.5">
            Quick Event Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#16181c] hover:bg-[#22252a] text-[#e7e9ea] border border-[#2f3336] transition-colors truncate max-w-full text-left"
              >
                #{p.hashtag}: {p.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            Event Headline *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Rogue AI Overrides Power Grid in Downtown"
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Event Hashtag
            </label>
            <div className="flex items-center bg-[#16181c] border border-[#2f3336] rounded-xl px-2.5 focus-within:border-twitter-blue">
              <span className="text-[#71767b] text-sm font-bold">#</span>
              <input
                type="text"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="Blackout2088"
                className="w-full px-1.5 py-2 bg-transparent text-[#e7e9ea] focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Impact Level
            </label>
            <select
              value={impactLevel}
              onChange={(e) => setImpactLevel(e.target.value as 'breaking' | 'high' | 'medium')}
              className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
            >
              <option value="breaking">🚨 Breaking (Global Panic)</option>
              <option value="high">⚡️ High (District Buzz)</option>
              <option value="medium">📢 Medium (Local Talk)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            Event Context / Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details for the simulation..."
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm resize-none"
          />
        </div>

        <div className="pt-3 border-t border-[#2f3336] flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setEventTriggerOpen(false)}
            className="px-4 py-2 border border-[#2f3336] text-[#e7e9ea] rounded-full text-xs font-semibold hover:bg-[#181818] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full text-xs transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Breaking News</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
