import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Bell, AlertTriangle, Zap } from 'lucide-react';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { playAlarmPattern } from '../utils/alarm';

export const SettingsPreferencesTab: React.FC = () => {
  const { isSoundEnabled, toggleSound, isBackgroundKeepAlive, toggleBackgroundKeepAlive } = useTreatmentContext();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert("이 브라우저는 시스템 알림을 지원하지 않습니다.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      playAlarmPattern(); // Test immediately
    }
  };

  const handleTestSound = () => {
    playAlarmPattern();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">알림 설정</span>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-5">
        
        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">치료 종료 알림음</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              타이머 종료 시 "삐-삐-삐" 반복음과 진동이 울립니다.
            </span>
          </div>
          
          <button 
            onClick={toggleSound}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              isSoundEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Background Mode Toggle */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
          <div className="flex flex-col pr-4">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              백그라운드 실행 유지
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              화면이 꺼져도 타이머가 멈추지 않도록 무음 오디오를 재생합니다. 
              <br/><span className="text-amber-600 dark:text-amber-500 font-bold">*배터리 소모가 약간 증가하지만 알림 신뢰성이 높아집니다.</span>
            </span>
          </div>
          
          <button 
            onClick={toggleBackgroundKeepAlive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shrink-0 ${
              isBackgroundKeepAlive ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isBackgroundKeepAlive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        
        {/* System Notification Permission Section */}
        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
          <div className="flex items-start gap-2 mb-2">
             <Bell className={`w-4 h-4 mt-0.5 ${permission === 'granted' ? 'text-green-500' : 'text-gray-400'}`} />
             <div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block">시스템 알림 사용 (Native Notification)</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                   모바일 기기의 기본 알림음과 진동을 사용하려면 권한이 필요합니다.<br/>
                   (iOS는 홈 화면에 추가 후 사용 가능)
                </span>
             </div>
          </div>
          
          {permission !== 'granted' ? (
             <button 
               onClick={handleRequestPermission}
               className="w-full mt-2 py-2 bg-brand-600 text-white text-xs font-bold rounded-md hover:bg-brand-700 active:scale-95 transition-all shadow-sm"
             >
               시스템 알림 권한 요청하기
             </button>
          ) : (
             <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 권한 허용됨 (Active)
                </span>
                {/* Re-request logic typically not needed if granted, but keeps UI clean */}
             </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
           <button 
             onClick={handleTestSound}
             className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:bg-brand-50 dark:hover:bg-brand-900/30 px-3 py-1.5 rounded-lg transition-colors"
           >
             <Play className="w-3 h-3 fill-current" />
             소리 및 알림 테스트
           </button>
        </div>
      </div>
      
      <div className="px-1 flex flex-col gap-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          * iOS/Android 모바일 기기에서는 무음 모드가 해제되어 있어야 소리가 들립니다.
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
          <span>iOS(아이폰)에서는 반드시 <strong>'공유 {'>'} 홈 화면에 추가'</strong>를 통해 앱을 설치해야 네이티브 진동/알림이 작동합니다.</span>
        </p>
      </div>
    </div>
  );
};