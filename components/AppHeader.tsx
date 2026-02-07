
import React from 'react';
import { Menu, Sun, Moon, Download, ClipboardList, Maximize } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppHeaderProps {
  onOpenMenu: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isLogOpen: boolean; // Added prop to track state
  onToggleLog: () => void;
  onToggleFullScreen: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMenu,
  isDarkMode,
  onToggleDarkMode,
  isLogOpen,
  onToggleLog,
  onToggleFullScreen,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    // pt-[env(safe-area-inset-top)] ensures content starts below the notch
    // h-full allows the parent container to control the total height including the safe area
    <header className="flex flex-col justify-end w-full h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm z-30 border-b border-slate-200/50 dark:border-slate-800/50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 h-14 landscape:h-10 shrink-0">
        <div className="flex items-center gap-3 landscape:gap-2">
          <button 
            onClick={onOpenMenu} 
            className="p-2 landscape:p-1 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
            aria-label="Main Menu"
          >
            <Menu className="w-6 h-6 landscape:w-5 landscape:h-5" />
          </button>
          <div className="flex items-center gap-2 select-none">
            <h1 className="text-lg landscape:text-base font-black text-slate-800 dark:text-white tracking-tighter leading-none flex items-center">
              PHYSIO<span className="text-brand-600">TRACK</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Full Screen Toggle */}
          <button 
            onClick={onToggleFullScreen}
            className="p-2 landscape:p-1 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
            aria-label="Full Screen"
            title="전체 화면"
          >
            <Maximize className="w-6 h-6 landscape:w-5 landscape:h-5" />
          </button>

          {/* Patient Log Toggle (Now visible on Desktop too) */}
          <button 
            onClick={onToggleLog}
            className={`p-2 landscape:p-1 rounded-xl transition-all active:scale-95 ${
              isLogOpen 
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Patient Log"
            title={isLogOpen ? "환자 현황 닫기" : "환자 현황 열기"}
          >
            <ClipboardList className="w-6 h-6 landscape:w-5 landscape:h-5" />
          </button>

          {isInstallable && (
            <button 
              onClick={install}
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 landscape:py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors font-bold text-xs animate-in fade-in slide-in-from-top-2"
            >
              <Download className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
              <span className="hidden sm:inline">앱 설치</span>
            </button>
          )}

          <button 
            onClick={onToggleDarkMode} 
            className="p-2.5 landscape:p-1.5 rounded-xl text-slate-600 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title={isDarkMode ? '라이트 모드' : '다크 모드'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 landscape:w-4 landscape:h-4" /> : <Moon className="w-5 h-5 landscape:w-4 landscape:h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
