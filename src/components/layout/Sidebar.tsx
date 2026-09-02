import React from 'react';
import {
  Home,
  Globe,
  Users,
  Bell,
  User,
  Settings,
  Feather,
  Radio,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSettingsOpen,
    setWorldSelectorOpen,
    setComposeModalOpen,
    setEventTriggerOpen,
  } = useSettingsStore();

  const { getActiveWorld } = useWorldStore();
  const activeWorld = getActiveWorld();

  const { getActiveUserCharacter } = useCharacterStore();
  const activeUser = getActiveUserCharacter(activeWorld.id);

  const { getUnreadCount } = useNotificationStore();
  const unreadNotifications = getUnreadCount(activeWorld.id);

  interface NavItem {
    id: 'feed' | 'world' | 'characters' | 'notifications' | 'profile';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'world', label: 'World & Lore', icon: Globe },
    { id: 'characters', label: 'Characters', icon: Users },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-16 xl:w-64 flex flex-col justify-between h-screen sticky top-0 px-2 xl:px-4 py-3 border-r border-[#2f3336] select-none">
      {/* Top Section */}
      <div className="flex flex-col items-center xl:items-start space-y-2">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-[#181818] transition-colors cursor-pointer w-fit">
          <div className="w-10 h-10 rounded-full bg-twitter-blue/10 flex items-center justify-center text-twitter-blue">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <span className="hidden xl:inline text-xl font-extrabold tracking-tight text-[#e7e9ea]">
            Sniffer
          </span>
        </div>

        {/* Active World Badge / Quick Switcher */}
        <button
          onClick={() => setWorldSelectorOpen(true)}
          className="w-full text-left hidden xl:flex items-center justify-between px-3 py-2 rounded-xl bg-[#16181c] border border-[#2f3336] hover:border-twitter-blue/50 transition-all text-xs text-[#71767b] group"
        >
          <div className="flex items-center space-x-2 truncate">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeWorld.themeAccent || '#1d9bf0' }}
            />
            <div className="truncate">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-twitter-blue">
                Current World
              </div>
              <div className="font-bold text-[#e7e9ea] truncate group-hover:text-twitter-blue transition-colors">
                {activeWorld.name}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#71767b] group-hover:text-[#e7e9ea]" />
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-1 w-full pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-4 px-3 py-3 rounded-full transition-all group w-fit xl:w-full ${
                  isActive
                    ? 'font-bold text-[#e7e9ea] bg-[#181818]'
                    : 'text-[#e7e9ea] hover:bg-[#16181c]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-twitter-blue stroke-[2.5]' : ''
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 bg-twitter-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-lg">{item.label}</span>
              </button>
            );
          })}

          {/* Quick World Event Trigger */}
          <button
            onClick={() => setEventTriggerOpen(true)}
            className="flex items-center space-x-4 px-3 py-3 rounded-full text-[#e7e9ea] hover:bg-[#16181c] transition-all group w-fit xl:w-full"
          >
            <Sparkles className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden xl:inline text-lg text-amber-400 font-medium">
              World Event
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center space-x-4 px-3 py-3 rounded-full text-[#e7e9ea] hover:bg-[#16181c] transition-all group w-fit xl:w-full"
          >
            <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform" />
            <span className="hidden xl:inline text-lg">Settings</span>
          </button>
        </nav>

        {/* Big Post Button */}
        <div className="w-full pt-4">
          <button
            onClick={() => setComposeModalOpen(true)}
            className="w-12 h-12 xl:w-full xl:h-12 rounded-full bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold flex items-center justify-center shadow-lg hover:shadow-twitter-blue/20 transition-all active:scale-95"
            title="Post"
          >
            <Feather className="w-6 h-6 xl:hidden" />
            <span className="hidden xl:inline text-base">Post</span>
          </button>
        </div>
      </div>

      {/* Bottom User Persona Card */}
      <div
        onClick={() => setActiveView('profile')}
        className="flex items-center justify-between p-2 rounded-full hover:bg-[#181818] transition-colors cursor-pointer w-fit xl:w-full mb-2 group"
      >
        <div className="flex items-center space-x-3 truncate">
          <Avatar src={activeUser.avatar} name={activeUser.name} size="md" />
          <div className="hidden xl:flex flex-col truncate">
            <span className="text-sm font-bold text-[#e7e9ea] truncate flex items-center">
              {activeUser.name}
              {activeUser.verified && (
                <VerifiedBadge type={activeUser.verifiedType} size={14} />
              )}
            </span>
            <span className="text-xs text-[#71767b] truncate">
              @{activeUser.handle}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
