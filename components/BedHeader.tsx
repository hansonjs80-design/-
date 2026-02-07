
import React, { memo, useState } from 'react';
import { CheckCircle, Settings, Pause, Play } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';
import { formatTime } from '../utils/bedUtils';
import { getBedHeaderStyles, getBedNumberColor } from '../utils/styleUtils';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { TimerEditPopup } from './bed-card/TimerEditPopup';
import { BedStatusPopup } from './bed-card/BedStatusPopup';
import { BedStatusBadges } from './BedStatusBadges';

// --- Sub-Components ---

const BedNumberAndStatus = memo(({ bed, onMovePatient, onEditStatus }: { bed: BedState; onMovePatient: (e: React.MouseEvent) => void; onEditStatus: (e: React.MouseEvent) => void }) => {
  const isBedT = bed.id === 11;
  return (
    <div className="flex items-center gap-2">
      {/* Bed Number */}
      <div 
        className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform select-none"
        onDoubleClick={onMovePatient}
        title="더블클릭하여 환자 이동"
      >
        <span className={`font-black tracking-tighter leading-none text-3xl lg:text-5xl ${getBedNumberColor(bed)}`}>
          {isBedT ? 'T' : bed.id}
        </span>
      </div>

      {/* Status Icons Area */}
      <div 
        className="flex items-center cursor-pointer p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onDoubleClick={onEditStatus}
        title="더블클릭하여 상태 아이콘 설정"
      >
        <BedStatusBadges bed={bed} />
      </div>
    </div>
  );
});

const BedTimer = memo(({ 
  bed, 
  isTimerActive, 
  isOvertime, 
  isNearEnd, 
  onTimerClick, 
  onTogglePause 
}: { 
  bed: BedState; 
  isTimerActive: boolean; 
  isOvertime: boolean; 
  isNearEnd: boolean; 
  onTimerClick: (e: React.MouseEvent) => void; 
  onTogglePause: (e: React.MouseEvent) => void;
}) => {
  if (!isTimerActive) {
    if (bed.status === BedStatus.COMPLETED) {
      return (
        <div className="flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full shadow-sm scale-[0.95] lg:scale-100 origin-right lg:origin-center">
          <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-xs lg:text-sm font-bold">완료</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-2 lg:gap-3 cursor-pointer transition-all scale-[0.95] lg:scale-100 origin-right lg:origin-center ${bed.isPaused ? 'opacity-50 grayscale' : ''}`}
    >
      {/* Timer Text */}
      <span 
        onDoubleClick={onTimerClick}
        className={`font-mono font-black text-2xl lg:text-4xl tracking-tight leading-none tabular-nums ${
        isOvertime ? 'text-red-500 animate-pulse' : 
        isNearEnd ? 'text-orange-500 animate-pulse' :
        'text-slate-700 dark:text-slate-200'
      }`}>
        {isOvertime && '+'}{formatTime(bed.remainingTime)}
      </span>

      {/* Pause Button */}
      <button 
        onClick={onTogglePause}
        className={`p-1.5 lg:p-2 rounded-full transition-colors active:scale-90 shadow-sm ${
          bed.isPaused 
            ? 'bg-brand-500 text-white' 
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
        }`}
      >
        {bed.isPaused ? <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" /> : <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />}
      </button>
    </div>
  );
});

const BedHeaderActions = memo(({ 
  bed, 
  onEditClick 
}: { 
  bed: BedState; 
  onEditClick: (id: number) => void; 
}) => {
  if (bed.status === BedStatus.IDLE) return null;

  return (
    <>
      {/* Settings Button: Hidden on Mobile (md:hidden), Visible on Tablet/Desktop (md:block) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onEditClick(bed.id); }}
        className="hidden md:block p-1.5 lg:p-2 translate-x-1 lg:translate-x-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors active:scale-90 scale-[0.95] lg:scale-100 origin-right"
      >
        <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>
    </>
  );
});

// --- Main Component ---

interface BedHeaderProps {
  bed: BedState;
  currentStep: TreatmentStep | undefined;
  onTrashClick: (e: React.MouseEvent) => void;
  trashState: 'idle' | 'confirm' | 'deleting';
  onEditClick?: (id: number) => void;
  onTogglePause?: (id: number) => void;
  onUpdateDuration?: (id: number, duration: number) => void;
  // Status Toggle Props
  onToggleInjection: (id: number) => void;
  onToggleFluid: (id: number) => void;
  onToggleTraction: (id: number) => void;
  onToggleESWT: (id: number) => void;
  onToggleManual: (id: number) => void;
}

export const BedHeader = memo(({ 
  bed, 
  currentStep, 
  onTrashClick, 
  trashState, 
  onEditClick, 
  onTogglePause, 
  onUpdateDuration,
  onToggleInjection,
  onToggleFluid,
  onToggleTraction,
  onToggleESWT,
  onToggleManual
}: BedHeaderProps) => {
  const { setMovingPatientState } = useTreatmentContext();
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const isTimerActive = bed.status === BedStatus.ACTIVE && !!currentStep?.enableTimer;
  const isOvertime = isTimerActive && bed.remainingTime <= 0;
  const isNearEnd = isTimerActive && bed.remainingTime > 0 && bed.remainingTime <= 60;
  
  const handleTimerDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isTimerActive || !onUpdateDuration) return;
    setIsEditingTimer(true);
  };

  const handleTimerSave = (newSeconds: number) => {
    if (onUpdateDuration) onUpdateDuration(bed.id, newSeconds);
    setIsEditingTimer(false);
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePause?.(bed.id);
  };

  const handleBedNumberDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMovingPatientState({ bedId: bed.id, x: e.clientX, y: e.clientY });
  };

  const handleStatusDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Open Status Edit Popup instead of full settings
    setIsEditingStatus(true);
  };

  return (
    <>
      <div className={`flex items-center justify-between px-2 py-1 lg:px-3 lg:py-3 shrink-0 relative transition-colors ${getBedHeaderStyles(bed)}`}>
        
        {/* Left: Bed Number & Status Icons */}
        <BedNumberAndStatus 
          bed={bed} 
          onMovePatient={handleBedNumberDoubleClick} 
          onEditStatus={handleStatusDoubleClick} 
        />

        {/* Right Section: Timer & Actions */}
        <div className="flex-1 flex justify-end items-center gap-1 lg:gap-2 pl-2">
          
          <BedTimer 
            bed={bed}
            isTimerActive={isTimerActive}
            isOvertime={isOvertime}
            isNearEnd={isNearEnd}
            onTimerClick={handleTimerDoubleClick}
            onTogglePause={handleTogglePause}
          />

          <BedHeaderActions 
            bed={bed}
            onEditClick={onEditClick!}
          />
        </div>
      </div>

      {isEditingTimer && (
        <TimerEditPopup
          title={`${bed.id === 11 ? '견인치료기' : `${bed.id}번 배드`} 시간 설정`}
          initialSeconds={bed.remainingTime}
          onConfirm={handleTimerSave}
          onCancel={() => setIsEditingTimer(false)}
        />
      )}

      {isEditingStatus && (
        <BedStatusPopup
          bed={bed}
          onClose={() => setIsEditingStatus(false)}
          onToggleInjection={onToggleInjection}
          onToggleFluid={onToggleFluid}
          onToggleTraction={onToggleTraction}
          onToggleESWT={onToggleESWT}
          onToggleManual={onToggleManual}
        />
      )}
    </>
  );
});
