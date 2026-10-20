import React, { useState, useEffect } from 'react';
import { Sparkles, Send, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { usePostStore } from '../../store/usePostStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useRelationshipStore } from '../../store/useRelationshipStore';
import { useSocialStatusStore } from '../../store/useSocialStatusStore';
import { useWorldMemoryStore } from '../../store/useWorldMemoryStore';
import { SimulationEngine } from '../../services/simulationEngine';
import { SocialEvaluator } from '../../services/socialEvaluator';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { RelationshipBadge } from '../relationships/RelationshipBadge';
import { WorldEncounter, EncounterOption } from '../../types/encounter';
import { Post } from '../../types/post';

export const InteractiveEncounterModal: React.FC = () => {
  const { isEventTriggerOpen, setEventTriggerOpen } = useSettingsStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getCharactersByWorld, getCharacterById, getActiveUserCharacter } = useCharacterStore();
  const characters = getCharactersByWorld(activeWorld.id);
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { addPost } = usePostStore();
  const { getRelationship, modifyAffinity } = useRelationshipStore();
  const { applyDeltas } = useSocialStatusStore();
  const { addMemory } = useWorldMemoryStore();

  const [currentEncounter, setCurrentEncounter] = useState<WorldEncounter | null>(null);
  const [customActionText, setCustomActionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [outcomeResult, setOutcomeResult] = useState<string | null>(null);

  // Generate a fresh encounter when modal opens
  useEffect(() => {
    if (isEventTriggerOpen) {
      setOutcomeResult(null);
      setCustomActionText('');
      const encounter = SimulationEngine.generateEncounter(activeWorld, characters);
      setCurrentEncounter(encounter);
    }
  }, [isEventTriggerOpen, activeWorld.id]);

  if (!currentEncounter) return null;

  const involvedCharacters = currentEncounter.involvedNpcIds
    .map((id) => getCharacterById(id))
    .filter(Boolean);

  const handleSelectOption = (opt: EncounterOption) => {
    if (isResolving) return;
    setIsResolving(true);

    // 1. Apply social stat changes
    const deltas = Object.entries(opt.statChanges).map(([stat, val]) => ({
      stat: stat as any,
      delta: val || 0,
      reason: `Encounter: ${currentEncounter.title}`,
    }));
    applyDeltas(activeWorld.id, deltas);

    // 2. Apply NPC affinity changes
    Object.entries(opt.affinityChanges).forEach(([npcId, delta]) => {
      modifyAffinity(
        npcId,
        activeWorld.id,
        delta,
        `Encounter choice in "${currentEncounter.title}"`,
        'event'
      );
    });

    // 3. Record into World Memory
    addMemory({
      worldId: activeWorld.id,
      category: 'encounter',
      summary: `${currentEncounter.title}: User chose "${opt.label}"`,
      fullContent: opt.outcomeText,
      actorName: activeUser.name,
      actorHandle: activeUser.handle,
      socialImpact: opt.outcomeText,
      involvedNpcIds: currentEncounter.involvedNpcIds,
    });

    // 4. Post player's timeline reaction
    const postId = `enc_post_${Date.now()}`;
    const userPost: Post = {
      id: postId,
      worldId: activeWorld.id,
      authorId: activeUser.id,
      content: opt.timelinePostText,
      createdAt: Date.now(),
      likesCount: Math.floor(Math.random() * 25) + 5,
      repostsCount: Math.floor(Math.random() * 8) + 1,
      repliesCount: 0,
      viewsCount: Math.floor(Math.random() * 200) + 50,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: ['EncounterResolved'],
    };
    addPost(userPost);

    // 5. Follow-up timeline reactions from the 1 or 2 involved NPCs
    involvedCharacters.forEach((npc, idx) => {
      if (!npc) return;
      setTimeout(() => {
        const delta = opt.affinityChanges[npc.id] || 0;
        let retort = '';
        if (delta > 0) {
          retort = `@${activeUser.handle} Solid move back there. Appreciate you having my back in ${activeWorld.name}.`;
        } else if (delta < 0) {
          retort = `@${activeUser.handle} You're going to regret crossing me today. Keep checking your perimeter.`;
        } else {
          retort = `@${activeUser.handle} What a complete circus that was. Still shaking my head.`;
        }

        const npcReply: Post = {
          id: `enc_reply_${Date.now()}_${idx}`,
          worldId: activeWorld.id,
          authorId: npc.id,
          content: retort,
          createdAt: Date.now(),
          replyToId: postId,
          rootPostId: postId,
          likesCount: Math.floor(Math.random() * 12) + 2,
          repostsCount: 0,
          repliesCount: 0,
          viewsCount: Math.floor(Math.random() * 60) + 15,
          likedBy: [],
          repostedBy: [],
          bookmarkedBy: [],
          tags: [],
        };
        addPost(npcReply);
      }, (idx + 1) * 1200);
    });

    setOutcomeResult(opt.outcomeText);
    setIsResolving(false);
  };

  const handleCustomActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim() || isResolving) return;
    setIsResolving(true);

    const action = customActionText.trim();

    // 1. Evaluate custom text for social stats
    const evaluation = SocialEvaluator.evaluateText(action);
    if (evaluation.deltas.length > 0) {
      applyDeltas(activeWorld.id, evaluation.deltas);
    }

    // 2. Evaluate persona shifts for the involved NPCs
    const shifts = SocialEvaluator.evaluatePersonaAffinityShifts(
      involvedCharacters as any,
      action,
      evaluation.dominantTone,
      evaluation.deltas
    );

    involvedCharacters.forEach((npc) => {
      if (!npc) return;
      const shift = shifts[npc.id] || { delta: 4, reason: 'Reacted to custom action' };
      modifyAffinity(npc.id, activeWorld.id, shift.delta, shift.reason, 'event');
    });

    // 3. Save into World Memory
    addMemory({
      worldId: activeWorld.id,
      category: 'encounter',
      summary: `${currentEncounter.title}: User custom action "${action.slice(0, 100)}"`,
      fullContent: action,
      actorName: activeUser.name,
      actorHandle: activeUser.handle,
      socialImpact: `Custom resolution: ${evaluation.analysis}`,
      involvedNpcIds: currentEncounter.involvedNpcIds,
    });

    // 4. Post timeline aftermath
    const postId = `custom_post_${Date.now()}`;
    const userPost: Post = {
      id: postId,
      worldId: activeWorld.id,
      authorId: activeUser.id,
      content: action,
      createdAt: Date.now(),
      likesCount: Math.floor(Math.random() * 30) + 8,
      repostsCount: Math.floor(Math.random() * 10) + 2,
      repliesCount: 0,
      viewsCount: Math.floor(Math.random() * 250) + 60,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      tags: ['CustomMove'],
    };
    addPost(userPost);

    // 5. Follow-up reaction from involved NPC
    if (involvedCharacters[0]) {
      setTimeout(() => {
        const npc = involvedCharacters[0]!;
        const replyPost: Post = {
          id: `enc_custom_reply_${Date.now()}`,
          worldId: activeWorld.id,
          authorId: npc.id,
          content: `@${activeUser.handle} Absolutely did not expect you to do that. Unhinged but noted.`,
          createdAt: Date.now(),
          replyToId: postId,
          rootPostId: postId,
          likesCount: Math.floor(Math.random() * 15) + 3,
          repostsCount: 0,
          repliesCount: 0,
          viewsCount: Math.floor(Math.random() * 80) + 20,
          likedBy: [],
          repostedBy: [],
          bookmarkedBy: [],
          tags: [],
        };
        addPost(replyPost);
      }, 1200);
    }

    setOutcomeResult(`Your custom action has executed and sent ripples across ${activeWorld.name}.`);
    setIsResolving(false);
  };

  const handleRerollEncounter = () => {
    setOutcomeResult(null);
    setCustomActionText('');
    const encounter = SimulationEngine.generateEncounter(activeWorld, characters);
    setCurrentEncounter(encounter);
  };

  return (
    <Modal
      isOpen={isEventTriggerOpen}
      onClose={() => setEventTriggerOpen(false)}
      title="World Encounter & Dilemma"
      maxWidth="xl"
    >
      <div className="space-y-4 text-sm pb-2">
        {/* If resolved outcome is showing */}
        {outcomeResult ? (
          <div className="p-6 rounded-2xl bg-[#16181c] border border-emerald-500/30 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#e7e9ea]">Encounter Resolved</h3>
              <p className="text-xs text-[#71767b] mt-1">
                Your decision has been logged into World Memory and broadcasted to the timeline.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-primary)]/60 border border-[#2f3336] text-xs text-[#e7e9ea] leading-relaxed italic">
              "{outcomeResult}"
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={handleRerollEncounter}
                className="px-4 py-2 border border-[#2f3336] text-[#e7e9ea] rounded-full text-xs font-semibold hover:bg-[#22252a] transition-colors"
              >
                Trigger Another Encounter
              </button>
              <button
                onClick={() => setEventTriggerOpen(false)}
                className="px-5 py-2 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs transition-all shadow-md"
              >
                Back to Feed
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header / Setting Banner */}
            <div className="flex items-center justify-between border-b border-[#2f3336] pb-3 gap-3">
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[#e7e9ea] truncate" title={currentEncounter.title}>
                    {currentEncounter.title}
                  </h3>
                  <span className="text-[11px] text-[#71767b] block truncate">{currentEncounter.setting}</span>
                </div>
              </div>

              <button
                onClick={handleRerollEncounter}
                className="flex items-center space-x-1 shrink-0 whitespace-nowrap text-[11px] text-twitter-blue hover:underline font-semibold px-2 py-1 rounded-lg hover:bg-twitter-blue/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reroll Scenario</span>
              </button>
            </div>

            {/* Involved Characters (1 or 2 NPCs) */}
            <div>
              <span className="text-[11px] uppercase font-bold text-[#71767b] tracking-wider block mb-2">
                Characters Involved ({involvedCharacters.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {involvedCharacters.map((npc) => {
                  if (!npc) return null;
                  const rel = getRelationship(npc.id, activeWorld.id);
                  return (
                    <div
                      key={npc.id}
                      className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#16181c] border border-[#2f3336] min-w-0 overflow-hidden"
                    >
                      <Avatar src={npc.avatar} name={npc.name} size="sm" className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <span className="font-bold text-xs text-[#e7e9ea] truncate" title={npc.name}>
                            {npc.name}
                          </span>
                          <span className="text-[10px] text-[#71767b] truncate shrink-0 max-w-[100px]">
                            @{npc.handle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5 mt-1 min-w-0">
                          <span className="text-[9px] font-mono uppercase text-[#71767b] truncate" title={npc.archetype}>
                            {npc.archetype.replace(/_/g, ' ')}
                          </span>
                          <div className="shrink-0">
                            <RelationshipBadge affinity={rel.affinity} tier={rel.tier} size="xs" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Situation Context */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#16181c] to-[#0c0d0e] border border-[#2f3336] text-xs text-[#e7e9ea] leading-relaxed">
              <span className="font-bold text-twitter-blue block mb-1">Situation:</span>
              {currentEncounter.situation}
            </div>

            {/* Selectable Choices */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#71767b] tracking-wider block">
                Select Your Resolution:
              </span>
              <div className="space-y-2">
                {currentEncounter.options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isResolving}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left p-3 rounded-xl border border-[#2f3336] bg-[#16181c] hover:border-twitter-blue hover:bg-twitter-blue/5 transition-all group active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#e7e9ea] group-hover:text-twitter-blue transition-colors">
                        {opt.label}
                      </span>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono shrink-0 flex-wrap justify-end gap-y-1">
                        {Object.entries(opt.statChanges).map(([stat, val]) => (
                          <span
                            key={stat}
                            className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)]/40 text-amber-300 border border-amber-900/40 shrink-0"
                          >
                            +{val} {stat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#71767b] mt-1 group-hover:text-[#e7e9ea]/90 transition-colors leading-relaxed">
                      {opt.actionText}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Write-in Action */}
            <form onSubmit={handleCustomActionSubmit} className="pt-2 border-t border-[#2f3336] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-[#71767b] tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-twitter-blue" />
                  <span>Or Write a Custom Action</span>
                </span>
                <span className="text-[10px] text-[#71767b]">AI evaluates tone & reaction</span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customActionText}
                  onChange={(e) => setCustomActionText(e.target.value)}
                  placeholder="e.g. I pull out an EMP charge and threaten both of them to walk away..."
                  className="flex-1 px-3 py-2 bg-[#16181c] border border-[#2f3336] rounded-xl text-[#e7e9ea] text-xs focus:outline-none focus:border-twitter-blue"
                />
                <button
                  type="submit"
                  disabled={!customActionText.trim() || isResolving}
                  className="px-4 py-2 bg-twitter-blue hover:bg-twitter-blueHover disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition-all active:scale-95 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};
