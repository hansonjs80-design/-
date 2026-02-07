import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, RotateCcw } from 'lucide-react';
import { SUPABASE_INIT_SQL } from '../../utils/sqlConstants';

interface MaintenanceToolsProps {
  onResetAllBeds: () => void;
  onClosePanel: () => void;
}

export const MaintenanceTools: React.FC<MaintenanceToolsProps> = ({ onResetAllBeds, onClosePanel }) => {
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_INIT_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeResetAll = () => {
    onResetAllBeds();
    onClosePanel();
    setShowResetAllConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* SQL Tools */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        {!showSql ? (
          <button 
            onClick={() => setShowSql(true)}
            className="w-full text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 rounded font-bold transition-colors border border-indigo-200"
          >
            + 데이터베이스 초기화 코드 보기 (SQL)
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-indigo-50 dark:bg-slate-800 rounded border border-indigo-100 dark:border-slate-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-indigo-800 dark:text-indigo-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Supabase SQL Editor에 실행
              </span>
              <button onClick={handleCopySql} className="text-xs flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-indigo-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm active:scale-95 transition-transform">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? '복사됨' : '코드 복사'}
              </button>
            </div>
            <pre className="bg-slate-800 text-slate-200 p-2.5 rounded text-[10px] overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto border border-slate-700">
              {SUPABASE_INIT_SQL}
            </pre>
            <button 
              onClick={() => setShowSql(false)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline w-full text-center"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* Emergency Reset */}
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">긴급 조치</h3>
        {!showResetAllConfirm ? (
          <button 
            onClick={() => setShowResetAllConfirm(true)}
            className="flex items-center justify-center w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            모든 배드 초기화
          </button>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-red-100 dark:border-red-900 animate-in fade-in zoom-in-95 duration-200">
             <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 text-center">
                정말 모든 배드의 치료 기록을<br/>초기화하시겠습니까? (복구 불가)
             </p>
             <div className="flex gap-2">
                <button onClick={executeResetAll} className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 shadow-sm">네, 초기화합니다</button>
                <button onClick={() => setShowResetAllConfirm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold hover:bg-gray-300">취소</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};