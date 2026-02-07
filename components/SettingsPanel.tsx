import React, { useState, Suspense } from 'react';
import { X, Database, List, Settings as SettingsIcon, Sliders, Loader2 } from 'lucide-react';
import { Preset } from '../types';

// Lazy load tabs to reduce initial bundle size
const SettingsDatabaseTab = React.lazy(() => import('./SettingsDatabaseTab').then(m => ({ default: m.SettingsDatabaseTab })));
const SettingsPresetTab = React.lazy(() => import('./SettingsPresetTab').then(m => ({ default: m.SettingsPresetTab })));
const SettingsPreferencesTab = React.lazy(() => import('./SettingsPreferencesTab').then(m => ({ default: m.SettingsPreferencesTab })));

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  onUpdatePresets: (presets: Preset[]) => void;
  onResetAllBeds: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  presets, 
  onUpdatePresets,
  onResetAllBeds
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'presets' | 'preferences'>('connection');
  
  return (
    <div className={`fixed inset-y-0 left-0 w-full sm:w-[600px] bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 z-[60] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header: Added safe-area padding to prevent status bar overlap */}
        <div className="bg-brand-600 text-white shrink-0 pt-[env(safe-area-inset-top)]">
          <div className="p-4 border-b border-brand-500 flex justify-between items-center h-14 sm:h-auto">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              설정 및 관리
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-brand-700 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
           <button 
             onClick={() => setActiveTab('connection')}
             className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
               activeTab === 'connection' 
                 ? 'text-brand-600 border-b-2 border-brand-600 dark:text-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-slate-700/50' 
                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
             }`}
           >
             <Database className="w-4 h-4" />
             <span className="hidden xs:inline">데이터</span>
             <span className="xs:hidden">DB</span>
           </button>
           <button 
             onClick={() => setActiveTab('presets')}
             className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
               activeTab === 'presets' 
                 ? 'text-brand-600 border-b-2 border-brand-600 dark:text-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-slate-700/50' 
                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
             }`}
           >
             <List className="w-4 h-4" />
             <span className="hidden xs:inline">처방 목록</span>
             <span className="xs:hidden">처방</span>
           </button>
           <button 
             onClick={() => setActiveTab('preferences')}
             className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
               activeTab === 'preferences' 
                 ? 'text-brand-600 border-b-2 border-brand-600 dark:text-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-slate-700/50' 
                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
             }`}
           >
             <Sliders className="w-4 h-4" />
             <span className="hidden xs:inline">기본 설정</span>
             <span className="xs:hidden">설정</span>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30 dark:bg-slate-900/30">
          <Suspense fallback={
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-brand-500/50 animate-spin" />
            </div>
          }>
            {activeTab === 'connection' && (
              <SettingsDatabaseTab 
                onResetAllBeds={onResetAllBeds} 
                onClosePanel={onClose} 
              />
            )}

            {activeTab === 'presets' && (
              <SettingsPresetTab 
                presets={presets} 
                onUpdatePresets={onUpdatePresets} 
              />
            )}

            {activeTab === 'preferences' && (
              <SettingsPreferencesTab />
            )}
          </Suspense>
        </div>
        
        {/* Footer: Added safe-area padding for bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 text-center text-[10px] text-gray-400 bg-white dark:bg-slate-800 shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          PhysioTrack Pro v2.0
        </div>
      </div>
    </div>
  );
};