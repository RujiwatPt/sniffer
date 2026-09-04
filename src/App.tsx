import React, { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { FeedTabs } from './components/feed/FeedTabs';
import { LiveSimulationTicker } from './components/feed/LiveSimulationTicker';
import { TweetComposer } from './components/feed/TweetComposer';
import { TweetCard } from './components/feed/TweetCard';
import { TweetThreadModal } from './components/feed/TweetThreadModal';
import { ComposeModal } from './components/feed/ComposeModal';
import { WorldSelectorModal } from './components/world/WorldSelectorModal';
import { WorldCreatorModal } from './components/world/WorldCreatorModal';
import { InteractiveEncounterModal } from './components/world/InteractiveEncounterModal';
import { WorldDetailView } from './components/world/WorldDetailView';
import { CharacterRoster } from './components/characters/CharacterRoster';
import { CharacterModal } from './components/characters/CharacterModal';
import { NotificationsView } from './components/notifications/NotificationsView';
import { UserProfileView } from './components/profile/UserProfileView';
import { SettingsModal } from './components/settings/SettingsModal';
import { DirectMessagesView } from './components/dm/DirectMessagesView';
import { NewChatModal } from './components/dm/NewChatModal';
import { DayTransitionModal } from './components/simulation/DayTransitionModal';

import { useSettingsStore } from './store/useSettingsStore';
import { useWorldStore } from './store/useWorldStore';
import { usePostStore } from './store/usePostStore';
import { useCharacterStore } from './store/useCharacterStore';
import { useSimulationStore } from './store/useSimulationStore';
import { SimulationEngine } from './services/simulationEngine';
import { Post } from './types/post';

export const App: React.FC = () => {
  const { activeView, settings } = useSettingsStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { posts, activeFilterTab, setSelectedThreadPostId } = usePostStore();
  const { getActiveUserCharacter } = useCharacterStore();

  const activeUser = getActiveUserCharacter(activeWorld.id);

  // Apply theme classes to body
  useEffect(() => {
    document.body.className = `antialiased selection:bg-[#1d9bf0]/30 selection:text-white overflow-x-hidden min-h-screen theme-${settings.themeMode}`;
    document.documentElement.style.setProperty('--accent-color', settings.accentColor || '#1d9bf0');
    if (settings.themeMode === 'light') {
      document.body.classList.add('bg-white', 'text-[#0f1419]');
    } else if (settings.themeMode === 'dim') {
      document.body.classList.add('bg-[#15202b]', 'text-[#f7f9f9]');
    } else {
      document.body.classList.add('bg-black', 'text-[#e7e9ea]');
    }
  }, [settings.themeMode, settings.accentColor]);

  // Living World Autonomous Heartbeat (simulation tick)
  useEffect(() => {
    if (!settings.autonomousFeed) return;

    const intervalTime = Math.max(15, settings.autonomousIntervalSeconds) * 1000;
    const interval = setInterval(() => {
      const npcs = useCharacterStore.getState().getCharactersByWorld(activeWorld.id).filter((c) => !c.isUser);
      if (npcs.length === 0) return;

      const randomAuthor = npcs[Math.floor(Math.random() * npcs.length)];
      const { timeOfDay } = useSimulationStore.getState();
      const content = SimulationEngine.generateAutonomousPost(activeWorld, randomAuthor, timeOfDay);

      const autoPost: Post = {
        id: `auto_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        worldId: activeWorld.id,
        authorId: randomAuthor.id,
        content,
        createdAt: Date.now(),
        likesCount: Math.floor(Math.random() * 15) + 1,
        repostsCount: Math.floor(Math.random() * 4),
        repliesCount: 0,
        viewsCount: Math.floor(Math.random() * 80) + 15,
        likedBy: [],
        repostedBy: [],
        bookmarkedBy: [],
        tags: [],
      };

      usePostStore.getState().addPost(autoPost);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [settings.autonomousFeed, settings.autonomousIntervalSeconds, activeWorld.id]);

  // Filter posts based on active world and selected feed tab
  const worldPosts = posts.filter((p) => p.worldId === activeWorld.id && !p.replyToId);

  const displayedPosts = worldPosts.filter((post) => {
    if (activeFilterTab === 'for_you') return true;
    if (activeFilterTab === 'following') {
      const isFollowed = useCharacterStore.getState().isFollowing(post.authorId, activeWorld.id);
      return post.authorId === activeUser.id || isFollowed;
    }
    if (activeFilterTab === 'pulse') {
      // Posts referencing world events or trending tags
      return post.tags.length > 0 || post.likesCount > 10;
    }
    return true;
  });

  return (
    <MainLayout>
      {activeView === 'feed' && (
        <div className="flex-1 flex flex-col">
          {/* Header Feed Tabs */}
          <FeedTabs />

          {/* Living Simulation Heartbeat Banner */}
          <LiveSimulationTicker />

          {/* Main Tweet Composer */}
          <TweetComposer />

          {/* Posts Stream */}
          <div className="divide-y divide-[#2f3336]">
            {displayedPosts.length === 0 ? (
              <div className="py-20 text-center text-[#71767b] text-sm space-y-2">
                <p className="font-bold text-[#e7e9ea]">No posts in {activeWorld.name} yet</p>
                <p className="text-xs">Post a thought above to ignite the roleplay simulation!</p>
              </div>
            ) : (
              displayedPosts.map((post) => (
                <TweetCard
                  key={post.id}
                  post={post}
                  onOpenThread={(p) => setSelectedThreadPostId(p.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeView === 'world' && <WorldDetailView />}
      {activeView === 'characters' && <CharacterRoster />}
      {activeView === 'notifications' && <NotificationsView />}
      {activeView === 'profile' && <UserProfileView />}
      {activeView === 'messages' && <DirectMessagesView />}

      {/* Global Modals */}
      <TweetThreadModal />
      <ComposeModal />
      <WorldSelectorModal />
      <WorldCreatorModal />
      <InteractiveEncounterModal />
      <CharacterModal />
      <SettingsModal />
      <DayTransitionModal />
      <NewChatModal />
    </MainLayout>
  );
};
