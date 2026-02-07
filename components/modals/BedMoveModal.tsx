
import React, { useState, useRef, useLayoutEffect, memo } from 'react';
import { ArrowRightLeft, Check, X } from 'lucide-react';
import { TOTAL_BEDS } from '../../constants';

interface BedMoveModalProps {
  fromBedId: number | null;
  initialPos: { x: number, y: number };
  onClose: () => void;
  onConfirm: (toBedId: number) => void;
}

export const BedMoveModal: React.FC<BedMoveModalProps> = memo(({ fromBedId, initialPos, onClose, onConfirm }) => {
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [pos, setPos] = useState(initialPos);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart Positioning
  useLayoutEffect(() => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      let newX = initialPos.x;
      let newY = initialPos.y;

      if (newX + rect.width > screenW) {
        newX = screenW - rect.width - 10;
      }
      if (newX < 10) newX = 10;

      if (newY + rect.height > screenH) {
        newY = initialPos.y - rect.height - 10;
      }
      if (newY < 10) newY = 10;

      setPos({ x: newX, y: newY });
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [initialPos]);

  if (fromBedId === null) return null;

  const handleConfirm = () => {
    const bedId = parseInt(targetBedId);
    if (!isNaN(bedId) && bedId > 0 && bedId <= TOTAL_BEDS) {
      if (bedId === fromBedId) {
        alert("현재 배드와 동일합니다.");
        return;
      }
      onConfirm(bedId);
      onClose();
    } else {
      alert("유효한 배드 번호를 입력해주세요.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-transparent"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="absolute w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-600 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-left"
        style={{ top: pos.y, left: pos.x }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-100 dark:bg-brand-900/30 rounded-md text-brand-600 dark:text-brand-400">
                <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>
            <div>
               <span className="text-[10px] font-bold text-gray-400 block leading-none mb-0.5">FROM BED {fromBedId}</span>
               <h3 className="font-bold text-sm text-gray-800 dark:text-white leading-none">환자 이동</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
           <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">To:</span>
              <input
                ref={inputRef}
                type="number"
                value={targetBedId}
                onChange={(e) => setTargetBedId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full bg-gray-50 dark:bg-slate-900 border-2 border-brand-500 rounded-lg py-2 px-3 text-lg font-black text-center text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                placeholder="?"
              />
           </div>
           
           <div className="flex gap-2 mt-4">
             <button 
                onClick={handleConfirm}
                className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold text-xs shadow-md shadow-brand-200 dark:shadow-none hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-1"
             >
                <Check className="w-3.5 h-3.5" />확인
             </button>
             <button 
                onClick={onClose}
                className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
             >
                취소
             </button>
           </div>
        </div>
      </div>
    </div>
  );
});
