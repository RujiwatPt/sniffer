import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Send,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { useDMStore } from '../../store/useDMStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useRelationshipStore } from '../../store/useRelationshipStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { RelationshipBadge } from '../relationships/RelationshipBadge';

export const DirectMessagesView: React.FC = () => {
  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    setNewChatModalOpen,
    getThreadMessages,
    sendUserMessageAndTriggerReply,
  } = useDMStore();

  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getActiveUserCharacter, getCharacterById } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { getRelationship } = useRelationshipStore();
  const { dayNumber, timeOfDay } = useSimulationStore();

  const [inputMessage, setInputMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter threads belonging to current world & involving current user
  const worldThreads = threads.filter(
    (t) => t.worldId === activeWorld.id && t.participantIds.includes(activeUser.id)
  );

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeNpcId = activeThread?.participantIds.find((id) => id !== activeUser.id);
  const activeNPC = activeNpcId ? getCharacterById(activeNpcId) : null;
  const activeRelationship = activeNPC ? getRelationship(activeNPC.id, activeWorld.id) : null;
  const activeMessages = activeThreadId ? getThreadMessages(activeThreadId) : [];

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeThread?.isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeThreadId || isSending) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      await sendUserMessageAndTriggerReply(activeThreadId, msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleStarterClick = (starter: string) => {
    setInputMessage(starter);
  };

  const formatMessageTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredThreads = worldThreads.filter((t) => {
    const otherId = t.participantIds.find((id) => id !== activeUser.id);
    const otherChar = otherId ? getCharacterById(otherId) : null;
    if (!otherChar) return false;
    return (
      otherChar.name.toLowerCase().includes(search.toLowerCase()) ||
      otherChar.handle.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] sm:h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {!activeThreadId || !activeNPC || !activeRelationship ? (
        /* View 1: Threads List (Inbox) */
        <div className="flex-1 flex flex-col h-full">
          {/* Top Header */}
          <div className="p-4 border-b border-[#2f3336] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
              <p className="text-xs text-[#71767b]">{activeWorld.name}</p>
            </div>
            <button
              onClick={() => setNewChatModalOpen(true)}
              className="p-2.5 rounded-full hover:bg-neutral-500/10 text-[var(--text-primary)] hover:text-twitter-blue transition-colors"
              title="New Message"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[#2f3336]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71767b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Direct Messages..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-xs text-[#e7e9ea] focus:outline-none focus:border-twitter-blue"
              />
            </div>
          </div>

          {/* Thread List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2f3336]/60">
            {filteredThreads.length === 0 ? (
              search ? (
                <div className="py-16 px-6 text-center space-y-1.5">
                  <p className="text-sm font-semibold text-[#e7e9ea]">No results found</p>
                  <p className="text-xs text-[#71767b]">
                    No direct message conversations match "{search}".
                  </p>
                </div>
              ) : (
                <div className="py-24 px-6 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-twitter-blue/10 text-twitter-blue flex items-center justify-center mx-auto">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#e7e9ea]">Welcome to your inbox!</h3>
                    <p className="text-xs text-[#71767b] leading-relaxed mt-1.5">
                      Drop a direct message to any character in {activeWorld.name} to form alliances, trade gossip, or spark rivalries.
                    </p>
                  </div>
                  <button
                    onClick={() => setNewChatModalOpen(true)}
                    className="px-5 py-2.5 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs transition-all shadow-md active:scale-95 inline-flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write a Message</span>
                  </button>
                </div>
              )
            ) : (
              filteredThreads.map((thread) => {
                const otherId = thread.participantIds.find((id) => id !== activeUser.id);
                const otherChar = otherId ? getCharacterById(otherId) : null;
                if (!otherChar) return null;

                const rel = getRelationship(otherChar.id, activeWorld.id);

                return (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className="p-3 sm:p-4 flex items-start space-x-3 cursor-pointer transition-colors hover:bg-[#101214]"
                  >
                    <Avatar src={otherChar.avatar} name={otherChar.name} size="md" className="shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate pr-1">
                          <span className="font-bold text-sm truncate">{otherChar.name}</span>
                          {otherChar.verified && (
                            <VerifiedBadge type={otherChar.verifiedType} size={14} />
                          )}
                          <span className="text-xs text-[#71767b] truncate">@{otherChar.handle}</span>
                        </div>
                        {thread.lastMessage && (
                          <span className="text-[10px] text-[#71767b] shrink-0">
                            {formatMessageTime(thread.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-[#71767b] truncate pr-2">
                          {thread.isTyping ? (
                            <span className="text-twitter-blue italic animate-pulse">typing...</span>
                          ) : thread.lastMessage ? (
                            thread.lastMessage.content
                          ) : (
                            <span className="italic text-[#71767b]">No messages yet</span>
                          )}
                        </p>

                        {thread.unreadCount > 0 && (
                          <span className="bg-twitter-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center shrink-0">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5">
                        <RelationshipBadge affinity={rel.affinity} tier={rel.tier} size="xs" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* View 2: Active Chat Conversation */
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Top Header */}
          <div className="p-3 sm:px-4 sm:py-3 border-b border-[#2f3336] bg-[var(--bg-primary)]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-3 truncate">
              <button
                onClick={() => setActiveThreadId(null)}
                className="p-1.5 -ml-1 text-[#71767b] hover:text-[var(--text-primary)] hover:bg-neutral-500/10 rounded-full transition-colors shrink-0"
                title="Back to Messages"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Avatar src={activeNPC.avatar} name={activeNPC.name} size="md" className="shrink-0" />

              <div className="truncate min-w-0">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="font-bold text-base text-[#e7e9ea] truncate">
                    {activeNPC.name}
                  </span>
                  {activeNPC.verified && (
                    <VerifiedBadge type={activeNPC.verifiedType} size={15} />
                  )}
                </div>
                <div className="text-xs text-[#71767b] truncate">
                  @{activeNPC.handle} · <span className="capitalize">{activeNPC.archetype}</span>
                </div>
              </div>
            </div>

            {/* Relationship Status Header Indicator */}
            <div className="flex items-center space-x-2 shrink-0">
              <RelationshipBadge
                affinity={activeRelationship.affinity}
                tier={activeRelationship.tier}
                size="sm"
              />
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* NPC Intro Card */}
            <div className="p-6 text-center border-b border-[#2f3336]/60 pb-6 mb-4 space-y-2">
              <Avatar src={activeNPC.avatar} name={activeNPC.name} size="xl" className="mx-auto" />
              <h3 className="font-bold text-lg text-[#e7e9ea] flex items-center justify-center space-x-1">
                <span>{activeNPC.name}</span>
                {activeNPC.verified && (
                  <VerifiedBadge type={activeNPC.verifiedType} size={16} />
                )}
              </h3>
              <p className="text-xs text-[#71767b]">@{activeNPC.handle}</p>
              <p className="text-xs text-[#e7e9ea]/80 max-w-sm mx-auto">{activeNPC.bio}</p>

              <div className="flex items-center justify-center space-x-2 pt-2 text-[11px] text-[#71767b]">
                <span className="flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-twitter-blue" />
                  <span>Timeline: Day {dayNumber} ({timeOfDay})</span>
                </span>
                <span>·</span>
                <span className="italic">Speech: {activeNPC.speechStyle}</span>
              </div>
            </div>

            {/* Messages list */}
            {activeMessages.map((msg) => {
              const isUser = msg.senderId === activeUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end space-x-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <Avatar src={activeNPC.avatar} name={activeNPC.name} size="sm" className="shrink-0" />
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-twitter-blue text-white rounded-br-none'
                        : 'bg-[#1e2226] text-[#e7e9ea] rounded-bl-none border border-[#2f3336]'
                    }`}
                  >
                    {msg.actionNote && (
                      <div className="text-[11px] text-twitter-blue font-mono italic mb-1">
                        {msg.actionNote}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    <div
                      className={`text-[9px] mt-1 text-right select-none ${
                        isUser ? 'text-white/70' : 'text-[#71767b]'
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live NPC Typing Indicator */}
            {activeThread?.isTyping && (
              <div className="flex items-end space-x-2">
                <Avatar src={activeNPC.avatar} name={activeNPC.name} size="sm" className="shrink-0" />
                <div className="bg-[#1e2226] border border-[#2f3336] rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-1.5 text-[#71767b]">
                  <span className="w-2 h-2 rounded-full bg-twitter-blue animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-twitter-blue animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-twitter-blue animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starters & Suggestions */}
          {activeMessages.length < 4 && (
            <div className="px-4 py-1.5 flex items-center space-x-2 overflow-x-auto scrollbar-none bg-[#0a0a0b] border-t border-[#2f3336]/60">
              <span className="text-[10px] text-[#71767b] font-mono shrink-0 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Starters:</span>
              </span>
              {[
                `Hey, what's your take on what happened today?`,
                `Are you planning to make a move soon?`,
                `Need someone reliable on your side.`,
                `Just checking in on your sector.`,
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleStarterClick(starter)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#16181c] hover:bg-[#202327] border border-[#2f3336] text-[#e7e9ea] whitespace-nowrap transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          {/* Message Composer Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-[#2f3336] bg-[var(--bg-primary)] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message @${activeNPC.handle}...`}
              className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[#2f3336] rounded-full text-sm text-[var(--text-primary)] focus:outline-none focus:border-twitter-blue"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-2.5 rounded-full bg-twitter-blue hover:bg-twitter-blueHover text-white transition-all disabled:opacity-40 disabled:hover:bg-twitter-blue active:scale-95 shadow-md shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
