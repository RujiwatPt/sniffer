import React from 'react';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] flex justify-center selection:bg-twitter-blue/20">
      <div className="w-full max-w-7xl flex">
        {/* Left Navigation Sidebar (Desktop & Tablet) */}
        <Sidebar />

        {/* Center Main Viewport */}
        <main className="flex-1 min-h-screen sm:border-r border-[#2f3336] max-w-[600px] w-full pb-20 sm:pb-0 flex flex-col min-w-0">
          <MobileHeader />
          <div className="flex-1 flex flex-col">{children}</div>
        </main>

        {/* Right Sidebar (Desktop) */}
        <RightSidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
};
