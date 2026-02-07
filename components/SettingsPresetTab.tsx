import React, { useState } from 'react';
import { Preset, QuickTreatment } from '../types';
import { PresetList } from './settings/PresetList';
import { PresetEditor } from './settings/PresetEditor';
import { QuickTreatmentList } from './settings/QuickTreatmentList';
import { QuickTreatmentEditor } from './settings/QuickTreatmentEditor';
import { useTreatmentContext } from '../contexts/TreatmentContext';

interface SettingsPresetTabProps {
  presets: Preset[];
  onUpdatePresets: (presets: Preset[]) => void;
}

export const SettingsPresetTab: React.FC<SettingsPresetTabProps> = ({ presets, onUpdatePresets }) => {
  const { quickTreatments, updateQuickTreatments } = useTreatmentContext();
  const [subTab, setSubTab] = useState<'presets' | 'quick'>('presets');
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [editingQuick, setEditingQuick] = useState<QuickTreatment | null>(null);

  // --- Preset Handlers ---
  const handleSavePreset = (preset: Preset) => {
    const existingIndex = presets.findIndex(p => p.id === preset.id);
    if (existingIndex >= 0) {
      const newPresets = [...presets];
      newPresets[existingIndex] = preset;
      onUpdatePresets(newPresets);
    } else {
      onUpdatePresets([...presets, preset]);
    }
    setEditingPreset(null);
  };

  const handleDeletePreset = (id: string) => {
    onUpdatePresets(presets.filter(p => p.id !== id));
  };

  // --- Quick Treatment Handlers ---
  const handleSaveQuick = (item: QuickTreatment) => {
    const existingIndex = quickTreatments.findIndex(q => q.id === item.id);
    if (existingIndex >= 0) {
      const newItems = [...quickTreatments];
      newItems[existingIndex] = item;
      updateQuickTreatments(newItems);
    } else {
      updateQuickTreatments([...quickTreatments, item]);
    }
    setEditingQuick(null);
  };

  const handleDeleteQuick = (id: string) => {
    updateQuickTreatments(quickTreatments.filter(q => q.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg mb-4 shrink-0">
        <button
          onClick={() => setSubTab('presets')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
            subTab === 'presets' 
              ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          세트 처방 (Presets)
        </button>
        <button
          onClick={() => setSubTab('quick')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
            subTab === 'quick' 
              ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          단일 치료 (Single)
        </button>
      </div>

      {/* 
        Fix: Removed 'overflow-hidden' to allow child components (Editors) 
        to manage their own scroll areas and height. 
        Added 'min-h-0' for flex nesting.
      */}
      <div className="flex-1 h-full min-h-0 relative">
        {subTab === 'presets' ? (
          <>
            {editingPreset ? (
              <PresetEditor 
                initialPreset={editingPreset}
                onSave={handleSavePreset}
                onCancel={() => setEditingPreset(null)}
                quickTreatments={quickTreatments}
              />
            ) : (
              <PresetList 
                presets={presets}
                onEdit={setEditingPreset}
                onDelete={handleDeletePreset}
                onCreate={() => setEditingPreset({ id: crypto.randomUUID(), name: '새 처방', steps: [] })}
                onUpdatePresets={onUpdatePresets}
              />
            )}
          </>
        ) : (
          <>
            {editingQuick ? (
              <QuickTreatmentEditor
                initialItem={editingQuick}
                onSave={handleSaveQuick}
                onCancel={() => setEditingQuick(null)}
              />
            ) : (
              <QuickTreatmentList
                items={quickTreatments}
                onEdit={setEditingQuick}
                onDelete={handleDeleteQuick}
                onCreate={() => setEditingQuick({ 
                   id: crypto.randomUUID(), 
                   name: '새 치료', 
                   label: 'New', 
                   duration: 10, 
                   color: 'bg-gray-500', 
                   enableTimer: true 
                })}
                onUpdateItems={updateQuickTreatments}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};