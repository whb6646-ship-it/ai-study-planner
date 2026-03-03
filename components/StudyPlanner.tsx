import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Trash2, Sparkles, Clock, Brain, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StudyPlanResult from './StudyPlanResult';
import { generateStudyPlan, StudyPlanResponse } from '../services/geminiService';

interface Subject {
  id: string;
  name: string;
  examDate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function StudyPlanner() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: '', examDate: '', difficulty: 'Medium' }
  ]);
  const [studyHours, setStudyHours] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanResponse | null>(null);

  const addSubject = () => {
    setSubjects([...subjects, { id: Math.random().toString(36).substr(2, 9), name: '', examDate: '', difficulty: 'Medium' }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleGenerate = async () => {
    if (subjects.some(s => !s.name || !s.examDate)) {
      alert('Please fill in all subject names and exam dates.');
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await generateStudyPlan({
        subjects,
        studyHours,
        startDate
      });
      setGeneratedPlan(plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedPlan) {
    return (
      <StudyPlanResult 
        plan={generatedPlan} 
        params={{ subjects, studyHours, startDate }}
        onBack={() => setGeneratedPlan(null)} 
        onUpdatePlan={(newPlan, newParams) => {
          setGeneratedPlan(newPlan);
          setSubjects(newParams.subjects);
          setStudyHours(newParams.studyHours);
          setStartDate(newParams.startDate);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-12"
    >
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} />
          AI Powered
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Create Your Study Plan</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
          Tell us about your subjects and goals to generate a custom plan tailored to your needs.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Subjects */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Brain className="text-indigo-600" size={22} />
                Subjects & Exams
              </h3>
              <button 
                onClick={addSubject}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={16} />
                Add Subject
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {subjects.map((subject, index) => (
                  <motion.div 
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="card p-6 space-y-6 group relative"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Subject Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mathematics"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                          className="w-full bg-transparent font-bold text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Exam Date</label>
                        <input 
                          type="date" 
                          value={subject.examDate}
                          onChange={(e) => updateSubject(subject.id, { examDate: e.target.value })}
                          className="w-full bg-transparent font-bold text-zinc-900 dark:text-zinc-100 outline-none text-lg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-2">Difficulty</label>
                        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                          {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                            <button
                              key={level}
                              onClick={() => updateSubject(subject.id, { difficulty: level })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                subject.difficulty === level 
                                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {subjects.length > 1 && (
                        <button 
                          onClick={() => removeSubject(subject.id)}
                          className="p-2 text-zinc-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Column: Global Settings */}
        <div className="space-y-8">
          <section className="card p-8 space-y-8">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="text-indigo-600" size={22} />
              Study Availability
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Daily Hours</label>
                  <div className="w-16 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {studyHours}h
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon size={16} className="text-zinc-400" />
                  Start Date
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </section>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>AI is Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Generate Study Plan</span>
              </>
            )}
          </button>

          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <Brain size={18} />
              <h4 className="font-bold text-sm">Pro Tip</h4>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              Be realistic with your study hours. It's better to study 2 hours consistently than 8 hours once a week.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
