
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Minimize } from 'lucide-react';
import { useHeaderScroll } from '../hooks/useHeaderScroll';
import { AppHeader } from './AppHeader';
import { BedLayoutContainer } from './BedLayoutContainer';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { GlobalModals } from './GlobalModals';

// Code Splitting for performance
const PatientLogPanel = React.lazy(() => import('./PatientLogPanel').then(module => ({ default: module.PatientLogPanel })));

export const MainLayout: React.FC = () => {
  const { beds, presets } = useTreatmentContext();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  
  // Initialize based on screen width: Open by default on XL screens (Desktop)
  const [isLogOpen, setLogOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  useHeaderScroll(mainRef, headerRef);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Dynamic class generation for main content area to handle Full Screen transitions
  const mainContentPadding = isFullScreen 
    ? 'pt-[calc(env(safe-area-inset-top)+8px)] md:pt-[26px]' 
    : `
      pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] 
      landscape:pt-[calc(2.5rem+env(safe-area-inset-top))]
      md:pt-2 
      md:landscape:pt-2
    `;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-100 dark:bg-slate-950 landscape:bg-transparent relative">
      {/* 
        Header Wrapper
        - Hidden when isFullScreen is true
      */}
      {!isFullScreen && (
        <div 
          ref={headerRef}
          className="
            w-full z-40 will-change-transform
            h-[calc(3.5rem+env(safe-area-inset-top))]
            landscape:h-[calc(2.5rem+env(safe-area-inset-top))]
            absolute top-0 left-0 right-0
            md:relative md:top-auto md:left-auto md:right-auto md:shrink-0
          "
        >
          <AppHeader 
            onOpenMenu={() => setMenuOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setDarkMode(!isDarkMode)}
            isLogOpen={isLogOpen}
            onToggleLog={() => setLogOpen(prev => !prev)}
            onToggleFullScreen={() => setIsFullScreen(true)}
          />
        </div>
      )}

      {/* 
        Main Content Area Wrapper
        - Handles Split Layout for Desktop (Bed List | Patient Log)
      */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Bed List Container */}
        <main 
          ref={mainRef}
          className={`
            flex-1 overflow-x-auto overflow-y-auto scroll-smooth touch-pan-x touch-pan-y overscroll-contain 
            bg-gray-200 dark:bg-slate-950 landscape:bg-transparent
            transition-all duration-300 ease-in-out
            
            /* Base Padding */
            px-0 
            ${mainContentPadding}
            pb-[calc(env(safe-area-inset-bottom)+1.5rem)]
            
            /* Tablet/Large Phone Portrait */
            sm:px-2 
            
            /* Desktop/Tablet Defaults (md+) */
            md:p-4 
            
            /* Mobile Landscape Overrides */
            landscape:px-0 
            landscape:pb-[env(safe-area-inset-bottom)]
            
            md:landscape:px-0
            md:landscape:pb-[env(safe-area-inset-bottom)]
          `}
        >
          <BedLayoutContainer beds={beds} presets={presets} />
        </main>

        {/* Exit Full Screen Button - Visible only in Full Screen Mode */}
        {isFullScreen && (
          <button
            onClick={() => setIsFullScreen(false)}
            className="fixed top-4 right-4 z-[60] p-2 bg-black/30 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:text-white hover:bg-black/50 dark:hover:bg-white/20 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95"
            title="전체 화면 종료"
          >
            <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* 
          Right: Patient Log Sidebar (Desktop)
          - Hidden on Mobile (< XL)
          - Hidden in Full Screen Mode
          - Animated Width & Slide for smooth toggle
          - Width increased to 620px
        */}
        <aside 
          className={`
            hidden xl:block 
            h-full shrink-0 relative z-30 
            transition-all duration-300 ease-out
            ${isFullScreen ? '!hidden' : ''}
            ${isLogOpen ? 'w-[620px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20 overflow-hidden'}
          `}
        >
           {/* Inner container with fixed width to prevent content squashing during transition */}
           <div className="w-[620px] h-full border-l border-gray-200 dark:border-slate-800">
             <Suspense fallback={<div className="w-full h-full bg-white dark:bg-slate-900 animate-pulse" />}>
               <PatientLogPanel />
             </Suspense>
           </div>
        </aside>

        {/* Mobile/Tablet Patient Log Overlay (Visible on < XL screens) */}
        <div className={`
          fixed inset-0 z-[100] bg-white dark:bg-slate-900 transition-transform duration-300 xl:hidden flex flex-col
          ${isLogOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
           <div className="flex-1 w-full h-full relative pb-[env(safe-area-inset-bottom)]">
             <Suspense fallback={<div className="w-full h-full bg-white dark:bg-slate-900 flex items-center justify-center"><span className="text-gray-400 font-bold">로딩 중...</span></div>}>
                <PatientLogPanel onClose={() => setLogOpen(false)} />
             </Suspense>
           </div>
        </div>
      </div>

      <GlobalModals 
        isMenuOpen={isMenuOpen} 
        onCloseMenu={() => setMenuOpen(false)} 
        presets={presets}
      />
    </div>
  );
};
