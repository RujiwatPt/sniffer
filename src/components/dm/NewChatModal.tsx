import React, { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useDMStore } from '../../store/useDMStore';
import { useRelationshipStore } from '../../store/useRelationshipStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { RelationshipBadge } from '../relationships/RelationshipBadge';

export const NewChatModal: React.FC = () => {
  const { isNewChatModalOpen, setNewChatModalOpen, getOrCreateThread, setActiveThreadId } =
    useDMStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();
  const { getCharactersByWorld, getActiveUserCharacter } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);
  const { getRelationship } = useRelationshipStore();

  const [search, setSearch] = useState('');

  const npcs = getCharactersByWorld(activeWorld.id).filter((c) => !c.isUser);

  const filteredNPCs = npcs.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      c.archetype.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCharacter = (npcId: string) => {
    const thread = getOrCreateThread(activeWorld.id, activeUser.id, npcId);
    setActiveThreadId(thread.id);
    setNewChatModalOpen(false);
  };

  return (
    <Modal
      isOpen={isNewChatModalOpen}
      onClose={() => setNewChatModalOpen(false)}
      title="New Message"
      maxWidth="lg"
    >
      <div className="space-y-3 pb-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#71767b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters by name, handle, or archetype..."
            className="w-full pl-10 pr-4 py-2 bg-[#16181c] border border-[#2f3336] rounded-full text-xs text-[#e7e9ea] focus:outline-none focus:border-twitter-blue"
            autoFocus
          />
        </div>

        {/* Characters List */}
        <div className="divide-y divide-[#2f3336]/60">
          {filteredNPCs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71767b]">
              No characters found matching "{search}".
            </div>
          ) : (
            filteredNPCs.map((char) => {
              const rel = getRelationship(char.id, activeWorld.id);
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char.id)}
                  className="p-3 hover:bg-[#16181c] rounded-xl flex items-center justify-between transition-colors cursor-pointer group gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar src={char.avatar} name={char.name} size="md" className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="font-bold text-sm text-[#e7e9ea] group-hover:text-twitter-blue transition-colors truncate">
                          {char.name}
                        </span>
                        {char.verified && (
                          <VerifiedBadge type={char.verifiedType} size={14} />
                        )}
                        <span className="text-xs text-[#71767b] truncate shrink-0 max-w-[120px]">
                          @{char.handle}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-1 min-w-0">
                        <RelationshipBadge
                          affinity={rel.affinity}
                          tier={rel.tier}
                          size="xs"
                        />
                        <span className="text-[10px] text-[#71767b] capitalize truncate">
                          {char.archetype.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-full text-[#71767b] group-hover:text-twitter-blue group-hover:bg-twitter-blue/10 transition-colors shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
