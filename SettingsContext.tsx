import React, { createContext, useContext, useState, useEffect } from 'react';

interface StudySettings {
  sessionLength: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  dailyGoalHours: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
}

interface SettingsContextType {
  settings: StudySettings;
  updateSettings: (updates: Partial<StudySettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('study_settings');
    return saved ? JSON.parse(saved) : {
      sessionLength: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      dailyGoalHours: 4,
      autoStartBreaks: false,
      autoStartSessions: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('study_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<StudySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
