import React from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Coffee, 
  ChevronRight,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyPlanResponse, StudyPlanParams, generateStudyPlan } from '../services/geminiService';
import { useProgress } from '../context/ProgressContext';

interface StudyPlanResultProps {
  plan: StudyPlanResponse;
  params: StudyPlanParams;
  onBack: () => void;
  onUpdatePlan: (newPlan: StudyPlanResponse, newParams: StudyPlanParams) => void;
}

export default function StudyPlanResult({ plan, params, onBack, onUpdatePlan }: StudyPlanResultProps) {
  const { progress, markSessionComplete, weeklyGoalMinutes } = useProgress();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editParams, setEditParams] = React.useState<StudyPlanParams>(params);
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newPlan = await generateStudyPlan(editParams);
      onUpdatePlan(newPlan, editParams);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
      alert('Failed to update study plan. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSessionToggle = (slot: any, index: number) => {
    const sessionId = `${slot.subject}-${slot.time}-${index}`;
    // For demo, assume each session is 60 mins if not specified
    markSessionComplete(sessionId, 60);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-1">
              <Sparkles size={12} />
              AI Generated Plan
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Your Study Roadmap</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
            {isEditing ? 'Close Editor' : 'Adjust Plan'}
          </button>
          <button 
            onClick={onBack}
            className="btn-primary flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Save Plan
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isEditing && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-8 bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800 space-y-8 mb-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" />
                    Daily Study Hours
                  </h4>
                  <div className="flex items-center gap-6">
                    <input 
                      type="range" 
                      min="1" max="12" step="0.5"
                      value={editParams.studyHours}
                      onChange={(e) => setEditParams({...editParams, studyHours: parseFloat(e.target.value)})}
                      className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="w-16 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                      {editParams.studyHours}h
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-600" />
                    Start Date
                  </h4>
                  <input 
                    type="date" 
                    value={editParams.startDate}
                    onChange={(e) => setEditParams({...editParams, startDate: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Subjects & Exams</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editParams.subjects.map((s, i) => (
                    <div key={s.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3 group transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                      <input 
                        type="text" 
                        value={s.name}
                        onChange={(e) => {
                          const newSubjects = [...editParams.subjects];
                          newSubjects[i] = { ...s, name: e.target.value };
                          setEditParams({ ...editParams, subjects: newSubjects });
                        }}
                        className="w-full font-bold bg-transparent dark:text-zinc-100 outline-none text-base"
                        placeholder="Subject Name"
                      />
                      <input 
                        type="date" 
                        value={s.examDate}
                        onChange={(e) => {
                          const newSubjects = [...editParams.subjects];
                          newSubjects[i] = { ...s, examDate: e.target.value };
                          setEditParams({ ...editParams, subjects: newSubjects });
                        }}
                        className="w-full text-xs text-zinc-500 dark:text-zinc-400 bg-transparent outline-none font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Updating Plan...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    <span>Regenerate Study Plan</span>
                  </>
                )}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 1. Weekly Overview */}
      <section className="card p-8 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
          <Calendar size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Calendar size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Weekly Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Total Hours</p>
              <p className="text-3xl font-bold">{plan.weeklyOverview.totalHours}h</p>
            </div>
            <div className="space-y-1">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Intensity</p>
              <p className="text-3xl font-bold">{plan.weeklyOverview.intensity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Focus Areas</p>
              <p className="text-3xl font-bold">{plan.weeklyOverview.focusAreas}</p>
            </div>
            <div className="space-y-1">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Completion</p>
              <p className="text-3xl font-bold">{Math.min(Math.round((progress.totalStudyMinutes / weeklyGoalMinutes) * 100), 100)}%</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                <Brain size={16} className="text-white" />
              </div>
              <p className="text-sm text-indigo-50 leading-relaxed font-medium">
                <span className="text-white font-bold">AI Insight:</span> {plan.weeklyOverview.aiInsight}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* 2. Daily Study Schedule */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="text-indigo-600" size={22} />
                Daily Study Schedule
              </h3>
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Today</span>
            </div>
            <div className="space-y-4">
              {plan.dailySchedule.map((slot, i) => {
                const sessionId = `${slot.subject}-${slot.time}-${i}`;
                const isCompleted = progress.completedSessionIds.includes(sessionId);
                
                return (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSessionToggle(slot, i)}
                    className={`card p-6 flex items-center gap-6 transition-all group cursor-pointer ${
                      isCompleted ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 opacity-75' : 'hover:border-indigo-200 dark:hover:border-indigo-900/50'
                    }`}
                  >
                    <div className={`w-1.5 h-14 rounded-full shrink-0 ${isCompleted ? 'bg-emerald-500' : slot.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg">{slot.time}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                        }`}>
                          {isCompleted ? 'Completed' : slot.type}
                        </span>
                      </div>
                      <h4 className={`text-lg font-bold transition-all truncate ${isCompleted ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {slot.subject}
                      </h4>
                      <p className={`text-sm transition-all truncate ${isCompleted ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {slot.topic}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isCompleted ? (
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={22} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-all">
                          <ChevronRight size={22} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* 4. Revision Plan */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <RefreshCw className="text-indigo-600" size={22} />
              Revision Strategy
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6 space-y-4 group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Brain size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Spaced Repetition</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{plan.revisionPlan.spacedRepetition}</p>
                </div>
              </div>
              <div className="card p-6 space-y-4 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Weekly Recap</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{plan.revisionPlan.weeklyRecap}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-10">
          {/* 3. Subject Priority Order */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <AlertCircle className="text-indigo-600" size={22} />
              Priority Order
            </h3>
            <div className="card divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
              {plan.priorityOrder.map((item, i) => (
                <div key={i} className="p-5 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.subject}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{item.reason}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                    item.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                    item.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Break Recommendations */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Coffee className="text-indigo-600" size={22} />
              Break Strategy
            </h3>
            <div className="card p-8 bg-zinc-900 dark:bg-zinc-950 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <Coffee size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                  Recommended Method
                </div>
                <h4 className="text-xl font-bold">{plan.breakStrategy.method}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {plan.breakStrategy.details}
                </p>
                <div className="pt-6 border-t border-white/10">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
                      <Sparkles size={16} className="text-indigo-400" />
                    </div>
                    <p className="text-sm text-zinc-400 italic">"{plan.breakStrategy.tip}"</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Actions */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            <button className="btn-secondary py-4 flex items-center justify-center gap-2">
              <Share2 size={20} />
              Share
            </button>
            <button className="btn-secondary py-4 flex items-center justify-center gap-2">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
