import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';

type TimerMode = 'focus' | 'short-break' | 'long-break';

export default function StudyMode() {
  const { addStudyMinutes } = useProgress();
  const { settings } = useSettings();

  const MODE_CONFIG = {
    focus: {
      label: 'Focus Time',
      minutes: settings.sessionLength,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      accent: 'bg-indigo-600',
      icon: Brain,
    },
    'short-break': {
      label: 'Short Break',
      minutes: settings.breakDuration,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      accent: 'bg-emerald-600',
      icon: Coffee,
    },
    'long-break': {
      label: 'Long Break',
      minutes: settings.longBreakDuration,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      accent: 'bg-blue-600',
      icon: Timer,
    },
  };

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODE_CONFIG[newMode].minutes * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_CONFIG[mode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update timeLeft when settings change if timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(MODE_CONFIG[mode].minutes * 60);
    }
  }, [settings.sessionLength, settings.breakDuration, settings.longBreakDuration, mode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // If it was a focus session, add to progress
      if (mode === 'focus') {
        addStudyMinutes(MODE_CONFIG.focus.minutes);
        // Auto-start break if enabled
        if (settings.autoStartBreaks) {
          switchMode('short-break');
          setIsActive(true);
        }
      } else {
        // Auto-start focus if enabled
        if (settings.autoStartSessions) {
          switchMode('focus');
          setIsActive(true);
        }
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode, addStudyMinutes, settings.autoStartBreaks, settings.autoStartSessions]);

  const progress = (timeLeft / (MODE_CONFIG[mode].minutes * 60)) * 100;
  const Icon = MODE_CONFIG[mode].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-10 py-12"
    >
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <Timer size={12} />
          Deep Work Mode
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Focus Timer</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-lg mx-auto">
          Stay focused and take regular breaks to maximize your learning efficiency.
        </p>
      </header>

      <div className="card p-10 md:p-16 flex flex-col items-center space-y-12 relative overflow-hidden">
        {/* Background Glow */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${MODE_CONFIG[mode].bg}`} />
        <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${MODE_CONFIG[mode].bg}`} />

        {/* Mode Selector */}
        <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-full max-w-md relative z-10">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`
                flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                ${mode === m 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
              `}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center z-10">
          {/* Progress Ring */}
          <svg className="w-72 h-72 md:w-96 md:h-96 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="stroke-zinc-100 dark:stroke-zinc-800 fill-none"
              strokeWidth="4"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="46%"
              className={`fill-none transition-all duration-500 ${MODE_CONFIG[mode].accent.replace('bg-', 'stroke-')}`}
              strokeWidth="6"
              strokeDasharray="100 100"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: progress / 100 }}
            />
          </svg>

          <div className="absolute flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-2xl ${MODE_CONFIG[mode].bg} ${MODE_CONFIG[mode].color} transition-colors duration-500`}>
              <Icon size={32} />
            </div>
            <span className="text-7xl md:text-8xl font-mono font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
              {formatTime(timeLeft)}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${MODE_CONFIG[mode].accent}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${MODE_CONFIG[mode].color}`}>
                {isActive ? 'Session Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 z-10">
          <button
            onClick={resetTimer}
            className="p-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
            title="Reset Timer"
          >
            <RotateCcw size={28} />
          </button>

          <button
            onClick={toggleTimer}
            className={`
              w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all transform active:scale-95
              ${isActive 
                ? 'bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600 shadow-zinc-200 dark:shadow-none' 
                : `${MODE_CONFIG[mode].accent} hover:opacity-90 shadow-indigo-200 dark:shadow-none`}
            `}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
          </button>

          <div className="w-16" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Tips Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-8 space-y-4 group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Brain size={24} />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Focus Strategy</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Put your phone in another room and close unnecessary tabs to minimize context switching and maximize deep work.
            </p>
          </div>
        </div>
        <div className="card p-8 space-y-4 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Coffee size={24} />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Active Recovery</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Stand up, stretch, or grab a glass of water. Avoid looking at screens during your break to let your brain reset.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
