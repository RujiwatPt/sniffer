import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DirectMessage, DMThread } from '../types/dm';
import { useWorldStore } from './useWorldStore';
import { useCharacterStore } from './useCharacterStore';
import { useSettingsStore } from './useSettingsStore';
import { useSimulationStore } from './useSimulationStore';
import { useRelationshipStore } from './useRelationshipStore';
import { useSocialStatusStore } from './useSocialStatusStore';
import { useWorldMemoryStore } from './useWorldMemoryStore';
import { AIService } from '../services/aiService';
import { SocialEvaluator } from '../services/socialEvaluator';

interface DMStoreState {
  threads: DMThread[];
  messages: Record<string, DirectMessage[]>;
  activeThreadId: string | null;
  isNewChatModalOpen: boolean;

  setActiveThreadId: (id: string | null) => void;
  setNewChatModalOpen: (open: boolean) => void;

  getOrCreateThread: (worldId: string, userCharId: string, npcCharId: string) => DMThread;
  getThreadById: (threadId: string) => DMThread | undefined;
  getThreadMessages: (threadId: string) => DirectMessage[];
  getUnreadCount: (worldId: string, userCharId: string) => number;

  sendMessage: (threadId: string, senderId: string, recipientId: string, content: string, actionNote?: string) => DirectMessage;
  receiveMessage: (threadId: string, senderId: string, recipientId: string, content: string, actionNote?: string) => DirectMessage;
  setTyping: (threadId: string, isTyping: boolean) => void;
  markThreadRead: (threadId: string) => void;

  sendUserMessageAndTriggerReply: (threadId: string, content: string) => Promise<void>;
  resetDMs: () => void;
}

export const useDMStore = create<DMStoreState>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      activeThreadId: null,
      isNewChatModalOpen: false,

      setActiveThreadId: (id) => {
        set({ activeThreadId: id });
        if (id) {
          get().markThreadRead(id);
        }
      },

      setNewChatModalOpen: (open) => {
        set({ isNewChatModalOpen: open });
      },

      getOrCreateThread: (worldId, userCharId, npcCharId) => {
        const { threads } = get();
        const existing = threads.find(
          (t) =>
            t.worldId === worldId &&
            t.participantIds.includes(userCharId) &&
            t.participantIds.includes(npcCharId)
        );

        if (existing) {
          return existing;
        }

        const newThreadId = `dm_thread_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newThread: DMThread = {
          id: newThreadId,
          worldId,
          participantIds: [userCharId, npcCharId],
          unreadCount: 0,
          isTyping: false,
          updatedAt: Date.now(),
        };

        set((state) => ({
          threads: [newThread, ...state.threads].slice(0, 50),
          messages: {
            ...state.messages,
            [newThreadId]: [],
          },
        }));

        return newThread;
      },

      getThreadById: (threadId) => {
        return get().threads.find((t) => t.id === threadId);
      },

      getThreadMessages: (threadId) => {
        return get().messages[threadId] || [];
      },

      getUnreadCount: (worldId, userCharId) => {
        const { threads } = get();
        return threads
          .filter((t) => t.worldId === worldId && t.participantIds.includes(userCharId))
          .reduce((acc, t) => acc + (t.unreadCount || 0), 0);
      },

      sendMessage: (threadId, senderId, recipientId, content, actionNote) => {
        const msg: DirectMessage = {
          id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          threadId,
          senderId,
          recipientId,
          content,
          createdAt: Date.now(),
          read: true,
          actionNote,
        };

        set((state) => {
          const currentMsgs = state.messages[threadId] || [];
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              return {
                ...t,
                lastMessage: msg,
                updatedAt: Date.now(),
              };
            }
            return t;
          });

          return {
            messages: {
              ...state.messages,
              [threadId]: [...currentMsgs, msg].slice(-100),
            },
            threads: updatedThreads,
          };
        });

        return msg;
      },

      receiveMessage: (threadId, senderId, recipientId, content, actionNote) => {
        const { activeThreadId } = get();
        const isActive = activeThreadId === threadId;

        const msg: DirectMessage = {
          id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          threadId,
          senderId,
          recipientId,
          content,
          createdAt: Date.now(),
          read: isActive,
          actionNote,
        };

        set((state) => {
          const currentMsgs = state.messages[threadId] || [];
          const updatedThreads = state.threads.map((t) => {
            if (t.id === threadId) {
              return {
                ...t,
                lastMessage: msg,
                unreadCount: isActive ? 0 : (t.unreadCount || 0) + 1,
                updatedAt: Date.now(),
              };
            }
            return t;
          });

          return {
            messages: {
              ...state.messages,
              [threadId]: [...currentMsgs, msg].slice(-100),
            },
            threads: updatedThreads,
          };
        });

        return msg;
      },

      setTyping: (threadId, isTyping) => {
        set((state) => ({
          threads: state.threads.map((t) => (t.id === threadId ? { ...t, isTyping } : t)),
        }));
      },

      markThreadRead: (threadId) => {
        set((state) => ({
          threads: state.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
          messages: {
            ...state.messages,
            [threadId]: (state.messages[threadId] || []).map((m) => ({ ...m, read: true })),
          },
        }));
      },

      sendUserMessageAndTriggerReply: async (threadId, content) => {
        const thread = get().getThreadById(threadId);
        if (!thread) return;

        const world = useWorldStore.getState().getActiveWorld();
        const activeUser = useCharacterStore.getState().getActiveUserCharacter(world.id);
        const npcId = thread.participantIds.find((id) => id !== activeUser.id);
        if (!npcId) return;

        const npcChar = useCharacterStore.getState().getCharacterById(npcId);
        if (!npcChar) return;

        // 1. Record user's message
        get().sendMessage(threadId, activeUser.id, npcChar.id, content);

        // 2. Evaluate social stats & dynamic affinity shift based on persona
        const evalResult = SocialEvaluator.evaluateText(content);
        if (evalResult.deltas.length > 0) {
          useSocialStatusStore.getState().applyDeltas(world.id, evalResult.deltas);
        }

        // Calculate persona-based affinity shift for this NPC
        const personaShifts = SocialEvaluator.evaluatePersonaAffinityShifts(
          [npcChar],
          content,
          evalResult.dominantTone,
          evalResult.deltas
        );
        const npcShift = personaShifts[npcChar.id];
        const affinityDelta = npcShift ? npcShift.delta : 2;
        const reason = npcShift ? npcShift.reason : 'Direct message exchange';

        const relStore = useRelationshipStore.getState();
        relStore.modifyAffinity(npcChar.id, world.id, affinityDelta, reason, 'dm');

        // Record key DM exchange into World Memory
        useWorldMemoryStore.getState().addMemory({
          worldId: world.id,
          category: 'user_dm',
          summary: `DM with @${npcChar.handle}: "${content.slice(0, 100)}"`,
          fullContent: content,
          actorName: activeUser.name,
          actorHandle: activeUser.handle,
          socialImpact: `${evalResult.dominantTone.toUpperCase()} tone (${affinityDelta >= 0 ? '+' : ''}${affinityDelta} affinity with @${npcChar.handle})`,
          involvedNpcIds: [npcChar.id],
        });

        // 3. Indicate typing
        get().setTyping(threadId, true);

        // Simulated typing delay between 800ms and 1800ms
        const delayMs = Math.floor(Math.random() * 1000) + 800;
        await new Promise((res) => setTimeout(res, delayMs));

        try {
          const settings = useSettingsStore.getState().settings;
          const { dayNumber, timeOfDay } = useSimulationStore.getState();
          const rel = relStore.getRelationship(npcChar.id, world.id);
          const history = get().getThreadMessages(threadId);

          const replyText = await AIService.triggerDMReply(
            settings,
            world,
            npcChar,
            activeUser,
            rel,
            history,
            content,
            dayNumber,
            timeOfDay
          );

          get().receiveMessage(threadId, npcChar.id, activeUser.id, replyText);
        } catch (err) {
          console.error('[DM] Failed to generate reply:', err);
        } finally {
          get().setTyping(threadId, false);
        }
      },

      resetDMs: () => {
        set({
          threads: [],
          messages: {},
          activeThreadId: null,
          isNewChatModalOpen: false,
        });
      },
    }),
    {
      name: 'sniffer_dm_store_v1',
    }
  )
);
