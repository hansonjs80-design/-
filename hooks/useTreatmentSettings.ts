
import { useLocalStorage } from './useLocalStorage';

export const useTreatmentSettings = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage<boolean>('physio-sound-enabled', false);
  const [isBackgroundKeepAlive, setIsBackgroundKeepAlive] = useLocalStorage<boolean>('physio-bg-keep-alive', true);

  const toggleSound = () => setIsSoundEnabled(prev => !prev);
  const toggleBackgroundKeepAlive = () => setIsBackgroundKeepAlive(prev => !prev);

  return {
    isSoundEnabled,
    toggleSound,
    isBackgroundKeepAlive,
    toggleBackgroundKeepAlive
  };
};
