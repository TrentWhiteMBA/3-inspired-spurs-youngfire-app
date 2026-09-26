import React from 'react';
import { Home, BookOpen, Layers, Sparkles } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'sanctuary', label: 'Sanctuary', icon: Home },
    { id: 'word', label: 'Word & Map', icon: BookOpen },
    { id: 'fellowship', label: 'Hubs', icon: Layers },
    { id: 'mentor', label: 'Mentor', icon: Sparkles },
  ];

  return (
    <nav 
      aria-label="Sanctuary Navigation" 
      className="fixed bottom-0 inset-x-0 z-40 bg-[#070C1C]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-amber-400 font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-500/15' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] font-mono tracking-tight font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
