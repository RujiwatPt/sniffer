import React, { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';
import { Character, CharacterArchetype, StanceTowardsUser } from '../../types/character';

export const CharacterModal: React.FC = () => {
  const { isCharacterModalOpen, setCharacterModalOpen } = useSettingsStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();
  const { addCharacter } = useCharacterStore();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [archetype, setArchetype] = useState<CharacterArchetype>('shitposter');
  const [speechStyle, setSpeechStyle] = useState('lowercase, witty internet slang');
  const [personality, setPersonality] = useState('');
  const [stanceTowardsUser, setStanceTowardsUser] = useState<StanceTowardsUser>('neutral');
  const [verified, setVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const randomAvatar = avatar.trim() || `https://picsum.photos/seed/${Math.floor(Math.random() * 100)}/200`;

    const newChar: Character = {
      id: `char_${Date.now()}`,
      worldId: activeWorld.id,
      name: name.trim(),
      handle: cleanHandle,
      avatar: randomAvatar,
      bio: bio.trim() || `Resident of ${activeWorld.name}.`,
      archetype,
      speechStyle: speechStyle.trim() || 'natural, expressive',
      personality: personality.trim() || `Roleplayer in ${activeWorld.name}.`,
      stanceTowardsUser,
      followerCount: Math.floor(Math.random() * 20000) + 100,
      followingCount: Math.floor(Math.random() * 800) + 20,
      verified,
      verifiedType: verified ? 'blue' : undefined,
      isUser: false,
      mood: 'neutral',
      createdAt: Date.now(),
    };

    addCharacter(newChar);
    setCharacterModalOpen(false);

    // Reset
    setName('');
    setHandle('');
    setAvatar('');
    setBio('');
    setPersonality('');
  };

  return (
    <Modal
      isOpen={isCharacterModalOpen}
      onClose={() => setCharacterModalOpen(false)}
      title={`Create Character for ${activeWorld.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Character Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              @Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="maya_lin"
              className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Archetype
            </label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as CharacterArchetype)}
              className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
            >
              <option value="shitposter">Shitposter / Troll</option>
              <option value="intellectual">Intellectual / Pedant</option>
              <option value="agitator">Agitator / Rebel</option>
              <option value="corporate_shill">Corporate Shill / PR</option>
              <option value="wholesome">Wholesome Cheerleader</option>
              <option value="conspiracy_theorist">Conspiracy Theorist</option>
              <option value="celebrity">Celebrity / Influencer</option>
              <option value="mystic">Mystic / Seer</option>
              <option value="doomer">Doomer / Pessimist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
              Stance Towards You
            </label>
            <select
              value={stanceTowardsUser}
              onChange={(e) => setStanceTowardsUser(e.target.value as StanceTowardsUser)}
              className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
            >
              <option value="neutral">Neutral Observer</option>
              <option value="admirer">Admirer / Fan</option>
              <option value="rival">Rival / Competitor</option>
              <option value="hater">Hater / Contrarian</option>
              <option value="simp">Simp / Diehard Loyalist</option>
              <option value="skeptic">Skeptic / Cynic</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            Bio
          </label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short Twitter bio..."
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            Speech Style & Quirks
          </label>
          <input
            type="text"
            value={speechStyle}
            onChange={(e) => setSpeechStyle(e.target.value)}
            placeholder="e.g. all lowercase, loves exclamation marks, archaic words"
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#71767b] uppercase tracking-wider mb-1">
            Avatar Image URL (Optional)
          </label>
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://... (leave empty for auto photo)"
            className="w-full px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] focus:outline-none focus:border-twitter-blue text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="verifiedCheck"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="w-4 h-4 rounded text-twitter-blue focus:ring-0 bg-[#16181c] border-[#2f3336]"
          />
          <label htmlFor="verifiedCheck" className="text-xs text-[#e7e9ea] select-none cursor-pointer">
            Verified Account (Blue Checkmark)
          </label>
        </div>

        <div className="pt-3 border-t border-[#2f3336] flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setCharacterModalOpen(false)}
            className="px-4 py-2 border border-[#2f3336] text-[#e7e9ea] rounded-full text-xs font-semibold hover:bg-[#181818] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs transition-all shadow-md active:scale-95"
          >
            Create Persona
          </button>
        </div>
      </form>
    </Modal>
  );
};
