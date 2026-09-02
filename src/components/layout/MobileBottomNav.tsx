import React from 'react';
import { Home, Globe, Users, Bell, Feather } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useWorldStore } from '../../store/useWorldStore';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, setComposeModalOpen } = useSettingsStore();
  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();
  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount(activeWorld.id);

  interface TabItem {
    id: 'feed' | 'world' | 'characters' | 'notifications';
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
  }

  const tabs: TabItem[] = [
    { id: 'feed', icon: Home, label: 'Home' },
    { id: 'world', icon: Globe, label: 'World' },
    { id: 'characters', icon: Users, label: 'Characters' },
    { id: 'notifications', icon: Bell, label: 'Alerts', badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for Post on Mobile */}
      <button
        onClick={() => setComposeModalOpen(true)}
        className="lg:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-twitter-blue hover:bg-twitter-blueHover text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform"
        aria-label="New Post"
      >
        <Feather className="w-6 h-6" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-t border-[#2f3336] flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className="flex flex-col items-center justify-center p-2 relative text-[#71767b] hover:text-[#e7e9ea]"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-twitter-blue' : 'text-[#71767b]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 bg-twitter-blue text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-twitter-blue font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
