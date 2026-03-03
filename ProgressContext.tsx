import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

interface ProgressData {
  completedSessionIds: string[];
  totalStudyMinutes: number;
  dailyStats: Record<string, number>; // date string -> minutes
  tasksCompleted: number;
  streak: number;
}

interface ProgressContextType {
  progress: ProgressData;
  markSessionComplete: (sessionId: string, minutes: number) => void;
  addStudyMinutes: (minutes: number) => void;
  weeklyGoalMinutes: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [progress, setProgress] = useState<ProgressData>(() => {
    const saved = localStorage.getItem('study_progress');
    return saved ? JSON.parse(saved) : {
      completedSessionIds: [],
      totalStudyMinutes: 0,
      dailyStats: {
        [new Date().toISOString().split('T')[0]]: 0
      },
      tasksCompleted: 0,
      streak: 0
    };
  });

  const weeklyGoalMinutes = settings.dailyGoalHours * 5 * 60; // 5 days a week goal

  useEffect(() => {
    localStorage.setItem('study_progress', JSON.stringify(progress));
  }, [progress]);

  const markSessionComplete = (sessionId: string, minutes: number) => {
    if (progress.completedSessionIds.includes(sessionId)) return;

    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => ({
      ...prev,
      completedSessionIds: [...prev.completedSessionIds, sessionId],
      totalStudyMinutes: prev.totalStudyMinutes + minutes,
      tasksCompleted: prev.tasksCompleted + 1,
      dailyStats: {
        ...prev.dailyStats,
        [today]: (prev.dailyStats[today] || 0) + minutes
      }
    }));
  };

  const addStudyMinutes = (minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + minutes,
      dailyStats: {
        ...prev.dailyStats,
        [today]: (prev.dailyStats[today] || 0) + minutes
      }
    }));
  };

  return (
    <ProgressContext.Provider value={{ progress, markSessionComplete, addStudyMinutes, weeklyGoalMinutes }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
