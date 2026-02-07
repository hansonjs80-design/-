
import { useCallback } from 'react';
import { BedState, BedStatus, Preset, TreatmentStep, QuickTreatment, PatientVisit } from '../types';
import { STANDARD_TREATMENTS } from '../constants';
import { calculateRemainingTime } from '../utils/bedLogic';
import { 
  createCustomPreset, 
  createQuickStep, 
  createSwappedPreset, 
  createTractionPreset 
} from '../utils/treatmentFactories';
import { findMatchingPreset, parseTreatmentString, generateTreatmentString } from '../utils/bedUtils';
import { useBedState } from './useBedState';

interface SelectPresetOptions {
  isInjection?: boolean;
  isFluid?: boolean;
  isTraction?: boolean;
  isESWT?: boolean;
  isManual?: boolean;
}

export const useBedManager = (
  presets: Preset[], 
  quickTreatments: QuickTreatment[],
  isSoundEnabled: boolean,
  isBackgroundKeepAlive: boolean,
  onAddVisit?: (data?: Partial<PatientVisit>) => Promise<string>,
  onUpdateVisit?: (bedId: number, updates: Partial<PatientVisit>) => void
) => {
  // Use extracted state hook
  const { beds, bedsRef, updateBedState, realtimeStatus } = useBedState(presets, isSoundEnabled, isBackgroundKeepAlive);

  // --- Treatment Actions ---

  const selectPreset = useCallback((bedId: number, presetId: string, options?: SelectPresetOptions) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    const firstStep = preset.steps[0];
    
    if (onAddVisit) {
        onAddVisit({
            bed_id: bedId,
            treatment_name: generateTreatmentString(preset.steps),
            is_injection: options?.isInjection || false,
            is_fluid: options?.isFluid || false,
            is_traction: options?.isTraction || false,
            is_eswt: options?.isESWT || false,
            is_manual: options?.isManual || false,
        });
    }

    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: presetId,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: Date.now(),
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isPaused: false,
      isInjection: options?.isInjection || false,
      isFluid: options?.isFluid || false,
      isTraction: options?.isTraction || false,
      isESWT: options?.isESWT || false,
      isManual: options?.isManual || false,
      memos: {}
    });
  }, [presets, updateBedState, onAddVisit]);

  const startCustomPreset = useCallback((bedId: number, name: string, steps: TreatmentStep[], options?: SelectPresetOptions) => {
    if (steps.length === 0) return;
    
    const customPreset = createCustomPreset(name, steps);
    const firstStep = steps[0];

    if (onAddVisit) {
        onAddVisit({
            bed_id: bedId,
            treatment_name: generateTreatmentString(steps),
            is_injection: options?.isInjection || false,
            is_fluid: options?.isFluid || false,
            is_traction: options?.isTraction || false,
            is_eswt: options?.isESWT || false,
            is_manual: options?.isManual || false,
        });
    }

    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: customPreset.id,
      customPreset: customPreset,
      currentStepIndex: 0,
      queue: [],
      startTime: Date.now(),
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isPaused: false,
      isInjection: options?.isInjection || false,
      isFluid: options?.isFluid || false,
      isTraction: options?.isTraction || false,
      isESWT: options?.isESWT || false,
      isManual: options?.isManual || false,
      memos: {}
    });
  }, [updateBedState, onAddVisit]);

  const startQuickTreatment = useCallback((bedId: number, template: typeof STANDARD_TREATMENTS[0], options?: SelectPresetOptions) => {
    const step = createQuickStep(template.name, template.duration, template.enableTimer, template.color);
    startCustomPreset(bedId, template.name, [step], options);
  }, [startCustomPreset]);

  const startTraction = useCallback((bedId: number, durationMinutes: number, options: any) => {
    const tractionPreset = createTractionPreset(durationMinutes);
    const firstStep = tractionPreset.steps[0];

    if (onAddVisit) {
        onAddVisit({
            bed_id: bedId,
            treatment_name: '견인', 
            is_traction: true, 
            is_injection: options?.isInjection || false,
            is_fluid: options?.isFluid || false,
            is_eswt: options?.isESWT || false,
            is_manual: options?.isManual || false,
        });
    }

    updateBedState(bedId, {
        status: BedStatus.ACTIVE,
        currentPresetId: tractionPreset.id,
        customPreset: tractionPreset,
        currentStepIndex: 0,
        queue: [],
        startTime: Date.now(),
        remainingTime: firstStep.duration,
        originalDuration: firstStep.duration,
        isPaused: false,
        ...options,
        memos: {}
    });
  }, [updateBedState, onAddVisit]);

  // --- Runtime Controls ---

  const nextStep = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status === BedStatus.IDLE) return;
    
    const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
    if (!preset) return;
    
    const nextIndex = bed.currentStepIndex + 1;
    
    if (nextIndex < preset.steps.length) {
      const nextStepItem = preset.steps[nextIndex];
      updateBedState(bedId, {
        currentStepIndex: nextIndex,
        queue: [],
        startTime: Date.now(),
        remainingTime: nextStepItem.duration,
        originalDuration: nextStepItem.duration,
        isPaused: false
      });
    } else {
      updateBedState(bedId, { status: BedStatus.COMPLETED, remainingTime: 0, isPaused: false });
    }
  }, [presets, updateBedState]);

  const prevStep = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status !== BedStatus.ACTIVE) return;
    
    const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
    if (!preset) return;

    const prevIndex = bed.currentStepIndex - 1;
    
    if (prevIndex >= 0) {
      const prevStepItem = preset.steps[prevIndex];
      updateBedState(bedId, {
        currentStepIndex: prevIndex,
        startTime: Date.now(),
        remainingTime: prevStepItem.duration,
        originalDuration: prevStepItem.duration,
        isPaused: false
      });
    }
  }, [presets, updateBedState]);

  const swapSteps = useCallback((bedId: number, idx1: number, idx2: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    const swapResult = createSwappedPreset(
      bed.customPreset, 
      bed.currentPresetId, 
      presets, 
      idx1, 
      idx2
    );

    if (!swapResult) return;

    const updates: Partial<BedState> = {
       customPreset: swapResult.preset,
       memos: {
         ...bed.memos,
         [idx1]: bed.memos[idx2],
         [idx2]: bed.memos[idx1]
       }
    };
    
    if (bed.status === BedStatus.ACTIVE && (bed.currentStepIndex === idx1 || bed.currentStepIndex === idx2)) {
       const currentStepItem = swapResult.steps[bed.currentStepIndex];
       updates.remainingTime = currentStepItem.duration;
       updates.originalDuration = currentStepItem.duration;
       updates.startTime = Date.now();
       updates.isPaused = false;
    }

    updateBedState(bedId, updates);
  }, [presets, updateBedState]);

  const togglePause = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status !== BedStatus.ACTIVE) return;

    if (!bed.isPaused) {
      const currentRemaining = calculateRemainingTime(bed, presets);
      updateBedState(bedId, { 
        isPaused: true, 
        remainingTime: currentRemaining 
      });
    } else {
      updateBedState(bedId, { 
        isPaused: false, 
        startTime: Date.now(),
        originalDuration: bed.remainingTime 
      });
    }
  }, [presets, updateBedState]);

  const clearBed = useCallback((bedId: number) => {
    updateBedState(bedId, {
      status: BedStatus.IDLE,
      currentPresetId: null,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: null,
      originalDuration: undefined,
      remainingTime: 0,
      isPaused: false,
      isInjection: false,
      isFluid: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    });
  }, [updateBedState]);

  const toggleFlag = useCallback((bedId: number, flag: keyof BedState) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (bed) {
        const newVal = !bed[flag];
        updateBedState(bedId, { [flag]: newVal });
        
        if (onUpdateVisit) {
            const map: Record<string, keyof PatientVisit> = {
                'isInjection': 'is_injection',
                'isFluid': 'is_fluid',
                'isTraction': 'is_traction',
                'isESWT': 'is_eswt',
                'isManual': 'is_manual'
            };
            const logKey = map[flag as string];
            if (logKey) {
                onUpdateVisit(bedId, { [logKey]: newVal });
            }
        }
    }
  }, [updateBedState, onUpdateVisit]);

  // --- Integration Logic (Logs & Live Edit) ---

  const overrideBedFromLog = useCallback((bedId: number, visit: PatientVisit, forceRestart: boolean) => {
    const treatmentName = visit.treatment_name || "";
    const matchingPreset = findMatchingPreset(presets, treatmentName);
    
    let steps: TreatmentStep[] = [];
    let currentPresetId: string | null = null;
    let customPreset: any = null;

    if (matchingPreset) {
      steps = matchingPreset.steps;
      if (!matchingPreset.id.startsWith('restored-')) {
          currentPresetId = matchingPreset.id;
      } else {
          customPreset = matchingPreset;
      }
    } else {
        steps = parseTreatmentString(treatmentName, quickTreatments);
        if (steps.length > 0) {
            customPreset = { id: `log-restore-${Date.now()}`, name: treatmentName, steps };
        }
    }

    if (steps.length === 0) return;

    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    const currentSteps = bed.customPreset?.steps || presets.find(p => p.id === bed.currentPresetId)?.steps || [];
    const isStepsChanged = JSON.stringify(steps) !== JSON.stringify(currentSteps);

    const updates: Partial<BedState> = {
        isInjection: visit.is_injection || false,
        isFluid: visit.is_fluid || false,
        isTraction: visit.is_traction || false,
        isESWT: visit.is_eswt || false,
        isManual: visit.is_manual || false,
    };

    if (forceRestart || bed.status !== BedStatus.ACTIVE || isStepsChanged) {
        const firstStep = steps[0];
        updates.status = BedStatus.ACTIVE;
        updates.currentPresetId = currentPresetId;
        updates.customPreset = customPreset;
        updates.currentStepIndex = 0;
        updates.queue = [];
        updates.startTime = Date.now();
        updates.remainingTime = firstStep ? firstStep.duration : 0;
        updates.originalDuration = firstStep ? firstStep.duration : 0;
        updates.isPaused = false;
        updates.memos = {};
    }

    updateBedState(bedId, updates);
  }, [presets, quickTreatments, updateBedState]);

  const moveBedState = useCallback(async (fromBedId: number, toBedId: number) => {
    const fromBed = bedsRef.current.find(b => b.id === fromBedId);
    if (!fromBed) return;

    const stateToMove: Partial<BedState> = {
        status: fromBed.status,
        currentPresetId: fromBed.currentPresetId,
        customPreset: fromBed.customPreset,
        currentStepIndex: fromBed.currentStepIndex,
        queue: fromBed.queue,
        startTime: fromBed.startTime,
        remainingTime: fromBed.remainingTime,
        originalDuration: fromBed.originalDuration,
        isPaused: fromBed.isPaused,
        isInjection: fromBed.isInjection,
        isFluid: fromBed.isFluid,
        isTraction: fromBed.isTraction,
        isESWT: fromBed.isESWT,
        isManual: fromBed.isManual,
        memos: fromBed.memos
    };

    await updateBedState(toBedId, stateToMove);
    clearBed(fromBedId);
  }, [updateBedState, clearBed]);

  const updateBedSteps = useCallback((bedId: number, newSteps: TreatmentStep[]) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;

      const oldSteps = bed.customPreset?.steps || presets.find(p => p.id === bed.currentPresetId)?.steps || [];
      const currentIdx = bed.currentStepIndex;
      
      const oldCurrentStep = oldSteps[currentIdx];
      const newCurrentStep = newSteps[currentIdx];

      const isCurrentStepChanged = !newCurrentStep ||
                                   !oldCurrentStep || 
                                   newCurrentStep.id !== oldCurrentStep.id ||
                                   newCurrentStep.duration !== oldCurrentStep.duration;

      const updates: Partial<BedState> = {
          customPreset: { id: `custom-edit-${Date.now()}`, name: '치료(수정됨)', steps: newSteps }
      };

      if (isCurrentStepChanged) {
          if (newCurrentStep) {
              updates.remainingTime = newCurrentStep.duration;
              updates.originalDuration = newCurrentStep.duration;
              updates.startTime = Date.now();
              updates.isPaused = false;
          } else {
              updates.status = BedStatus.COMPLETED;
              updates.remainingTime = 0;
          }
      } 

      updateBedState(bedId, updates);
      
      if (onUpdateVisit) {
          onUpdateVisit(bedId, { treatment_name: generateTreatmentString(newSteps) });
      }
  }, [presets, updateBedState, onUpdateVisit]);

  return { 
    beds, 
    selectPreset, 
    startCustomPreset, 
    startQuickTreatment, 
    startTraction,
    nextStep,
    prevStep,
    swapSteps, 
    togglePause,
    jumpToStep: (bedId: number, stepIndex: number) => {},
    toggleInjection: (id: number) => toggleFlag(id, 'isInjection'),
    toggleFluid: (id: number) => toggleFlag(id, 'isFluid'),
    toggleTraction: (id: number) => toggleFlag(id, 'isTraction'),
    toggleESWT: (id: number) => toggleFlag(id, 'isESWT'),
    toggleManual: (id: number) => toggleFlag(id, 'isManual'),
    updateMemo: (bedId: number, idx: number, memo: string | null) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      const newMemos = { ...bed.memos };
      if (!memo) delete newMemos[idx]; else newMemos[idx] = memo;
      updateBedState(bedId, { memos: newMemos });
    },
    updateBedDuration: (bedId: number, dur: number) => updateBedState(bedId, { startTime: Date.now(), remainingTime: dur, originalDuration: dur, isPaused: false }),
    updateBedSteps,
    clearBed, 
    resetAll: () => bedsRef.current.forEach(bed => clearBed(bed.id)),
    realtimeStatus,
    overrideBedFromLog,
    moveBedState
  };
};
