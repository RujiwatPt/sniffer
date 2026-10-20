import React from 'react';
import { usePostStore, FeedFilterTab } from '../../store/usePostStore';

export const FeedTabs: React.FC = () => {
  const { activeFilterTab, setActiveFilterTab } = usePostStore();

  const tabs: Array<{ id: FeedFilterTab; label: string }> = [
    { id: 'for_you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'pulse', label: 'World Pulse' },
  ];

  return (
    <div className="sticky top-0 lg:top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[#2f3336] flex">
      {tabs.map((tab) => {
        const isActive = activeFilterTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveFilterTab(tab.id)}
            className="flex-1 py-3.5 hover:bg-neutral-500/10 transition-colors flex justify-center items-center relative text-sm font-semibold"
          >
            <span
              className={`transition-colors ${
                isActive ? 'text-[var(--text-primary)] font-bold' : 'text-[#71767b]'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 h-1 w-14 bg-twitter-blue rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
