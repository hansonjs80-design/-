
import React from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, CalendarCheck, Printer, X } from 'lucide-react';

interface PatientLogHeaderProps {
  totalCount: number;
  currentDate: string;
  onDateChange: (offset: number) => void;
  onDateSelect: (date: string) => void;
  onPrint: () => void;
  onClose?: () => void;
}

export const PatientLogHeader: React.FC<PatientLogHeaderProps> = ({
  totalCount,
  currentDate,
  onDateChange,
  onDateSelect,
  onPrint,
  onClose
}) => {
  const handleTodayClick = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset).toISOString().split('T')[0];
    onDateSelect(localDate);
  };

  // Style matched to Bed Card Header (Cleaner white background)
  return (
    <div className="shrink-0 px-4 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top))] bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex flex-row items-center justify-between gap-2 touch-none rounded-t-2xl">
      <div className="flex items-center gap-3">
        <h3 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
          <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-xl text-brand-600 dark:text-brand-400">
             <ClipboardList className="w-5 h-5" strokeWidth={3} />
          </div>
          <span className="hidden xs:inline">환자 현황</span>
        </h3>
        <span className="text-sm font-bold text-gray-400 dark:text-gray-500 flex items-baseline gap-1 select-none">
          Total <span className="text-brand-600 dark:text-brand-400 text-xl font-black leading-none">{totalCount}</span>
        </span>
      </div>
      
      <div className="flex items-center gap-2">
         {/* Print Button */}
         <button 
           onClick={onPrint}
           className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
           title="리스트 출력 (A4)"
         >
           <Printer className="w-5 h-5" />
         </button>

         <div className="flex items-center bg-gray-50 dark:bg-slate-900 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
          <button 
            onClick={() => onDateChange(-1)}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600 shadow-sm hover:shadow"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={3} />
          </button>
          
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => onDateSelect(e.target.value)}
            className="bg-transparent font-black text-slate-700 dark:text-slate-200 outline-none text-center cursor-pointer text-sm w-[90px] xs:w-[100px]"
          />
          
          <button 
            onClick={() => onDateChange(1)}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600 shadow-sm hover:shadow"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </button>

          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1 hidden xs:block"></div>

          <button 
            onClick={handleTodayClick}
            className="hidden xs:block p-1.5 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-lg transition-colors group"
            title="오늘 날짜로 이동"
          >
            <CalendarCheck className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
          </button>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ml-1 shadow-sm active:scale-90"
            title="닫기"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
};
