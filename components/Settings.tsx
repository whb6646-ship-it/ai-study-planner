import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  LogOut, 
  Trash2, 
  BookOpen, 
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all planner data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const cycleValue = (key: keyof typeof settings, options: any[]) => {
    const currentIndex = options.indexOf(settings[key]);
    const nextIndex = (currentIndex + 1) % options.length;
    updateSettings({ [key]: options[nextIndex] });
  };

  const sections = [
    { 
      title: 'Appearance', 
      icon: theme === 'dark' ? Moon : Sun, 
      items: [
        { 
          label: 'Theme Mode', 
          value: theme === 'dark' ? 'Dark' : 'Light', 
          action: toggleTheme,
          toggle: true,
          isToggled: theme === 'dark'
        }
      ] 
    },
    { 
      title: 'Study Preferences', 
      icon: BookOpen, 
      items: [
        { 
          label: 'Study Session Length', 
          value: `${settings.sessionLength} mins`, 
          action: () => cycleValue('sessionLength', [15, 25, 45, 60, 90]) 
        },
        { 
          label: 'Break Duration', 
          value: `${settings.breakDuration} mins`, 
          action: () => cycleValue('breakDuration', [5, 10, 15]) 
        },
        { 
          label: 'Daily Goal', 
          value: `${settings.dailyGoalHours} hours`, 
          action: () => cycleValue('dailyGoalHours', [2, 4, 6, 8]) 
        },
        { 
          label: 'Auto-Start Breaks (REST)', 
          value: settings.autoStartBreaks ? 'On' : 'Off', 
          action: () => updateSettings({ autoStartBreaks: !settings.autoStartBreaks }),
          toggle: true,
          isToggled: settings.autoStartBreaks
        },
        { 
          label: 'Half-Time Reminders', 
          value: settings.autoStartSessions ? 'On' : 'Off', 
          action: () => updateSettings({ autoStartSessions: !settings.autoStartSessions }),
          toggle: true,
          isToggled: settings.autoStartSessions
        }
      ] 
    },
    { 
      title: 'Account & Data', 
      icon: Shield, 
      items: [
        { label: 'Export Study Data', value: 'JSON', action: () => {} },
        { label: 'Reset All Data', value: 'Danger', action: handleResetData, danger: true }
      ] 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-10 pb-12"
    >
      <header className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">Customize your study experience and manage your personal data.</p>
      </header>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <section key={i} className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-2">
              <section.icon size={14} />
              {section.title}
            </h3>
            <div className="card divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
              {section.items.map((item, j) => (
                <button 
                  key={j} 
                  onClick={item.action}
                  className="w-full px-6 py-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex justify-between items-center group"
                >
                  <div className="space-y-0.5">
                    <span className={`font-bold text-base ${item.danger ? 'text-rose-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {item.label}
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Manage your {item.label.toLowerCase()} preferences</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.value && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                        item.danger 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' 
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {item.value}
                      </span>
                    )}
                    {item.toggle ? (
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${item.isToggled ? 'bg-indigo-600' : 'bg-zinc-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${item.isToggled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        <button className="w-full flex items-center justify-center space-x-2 px-6 py-5 text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/20 group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      <div className="text-center py-10 space-y-2">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-[0.2em]">AI Study Planner • Premium Edition</p>
        <p className="text-xs text-zinc-300 dark:text-zinc-700">Version 1.0.0 (Build 2024.01)</p>
      </div>
    </motion.div>
  );
}
