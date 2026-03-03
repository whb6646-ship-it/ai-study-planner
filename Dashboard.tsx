import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Timer, 
  Target, 
  ChevronRight,
  AlertCircle,
  Trophy,
  Zap,
  Brain,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useProgress } from '../context/ProgressContext';

interface DashboardProps {
  onNavigate?: () => void;
  onStudyModeClick?: () => void;
}

export default function Dashboard({ onNavigate, onStudyModeClick }: DashboardProps) {
  const { progress, weeklyGoalMinutes } = useProgress();
  
  const todaySessions: any[] = [];
  const upcomingExams: any[] = [];

  const totalHours = (progress.totalStudyMinutes / 60).toFixed(1);
  const weeklyProgressPercent = Math.min(Math.round((progress.totalStudyMinutes / weeklyGoalMinutes) * 100), 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">Student</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Ready to crush your study goals today?
          </p>
        </div>
        <button 
          onClick={onNavigate}
          className="btn-primary flex items-center justify-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Create Study Plan
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg">Today</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Study Time</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalHours}h
            </h3>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">Weekly</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Streak</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{progress.streak} Days</h3>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Critical</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Next Exam</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {upcomingExams.length > 0 ? `${upcomingExams[0].days} Days` : 'None Set'}
            </h3>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <div className="w-12 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${weeklyProgressPercent}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Goal Progress</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {weeklyProgressPercent}%
            </h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={22} />
                Today's Focus
              </h3>
              <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View Full Plan</button>
            </div>

            <div className="space-y-3">
              {todaySessions.length > 0 ? (
                todaySessions.map((session, i) => {
                  const isCompleted = progress.completedSessionIds.includes(session.id) || session.status === 'completed';
                  return (
                    <div key={i} className="card p-5 flex items-center gap-4 group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900/50">
                      <div className={`w-1.5 h-10 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-bold ${isCompleted ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {session.subject}
                          </h4>
                          <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500">{session.time}</span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{session.topic}</p>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <ChevronRight size={20} className="text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-600 transition-colors" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="card p-10 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <Calendar size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">No sessions scheduled</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Create your first study plan to get started.</p>
                  </div>
                  <button onClick={onNavigate} className="btn-secondary text-xs">Create Plan</button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Target className="text-indigo-600" size={22} />
              Weekly Progress
            </h3>
            <div className="card p-8">
              <div className="flex items-end justify-between h-32 gap-2">
                {[0, 0, 0, 0, 0, 0, 0].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-indigo-100 dark:bg-indigo-500/10 rounded-t-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/20 transition-all relative"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {height}m
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="text-amber-500" size={22} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={onStudyModeClick}
                className="card p-4 flex items-center gap-4 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 group text-left"
              >
                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Timer size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Focus Timer</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Start a Pomodoro session</p>
                </div>
              </button>
              <button 
                onClick={onNavigate}
                className="card p-4 flex items-center gap-4 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 group text-left"
              >
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">New Plan</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Adjust your study goals</p>
                </div>
              </button>
            </div>
          </section>

          <section className="card p-6 bg-zinc-900 dark:bg-indigo-600 text-white border-none shadow-xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Brain size={18} />
              AI Tip of the Day
            </h4>
            <p className="text-sm text-zinc-300 dark:text-indigo-100 leading-relaxed">
              The "Spaced Repetition" technique is most effective when you review material 24 hours, 3 days, and 1 week after first learning it.
            </p>
          </section>

          <section className="card p-6">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Trophy className="text-amber-500" size={18} />
              Upcoming Exams
            </h4>
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{exam.subject}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{exam.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-500">{exam.days}d</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Left</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No exams added yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
