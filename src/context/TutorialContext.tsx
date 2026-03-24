import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, updateSetting } from '../storage/settingsStorage';

interface TutorialContextType {
  isTutorialVisible: boolean;
  showTutorial: () => void;
  completeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings.hasSeenOnboarding && !settings.hasSeenTutorial) {
        setIsTutorialVisible(true);
      }
    });
  }, []);

  const showTutorial = useCallback(() => {
    setIsTutorialVisible(true);
  }, []);

  const completeTutorial = useCallback(async () => {
    setIsTutorialVisible(false);
    await updateSetting('hasSeenTutorial', true);
  }, []);

  return (
    <TutorialContext.Provider value={{ isTutorialVisible, showTutorial, completeTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
