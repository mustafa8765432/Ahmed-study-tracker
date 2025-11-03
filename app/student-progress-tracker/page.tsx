'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Plus, X, Play, Pause, RotateCcw, Flame,
  BookOpen, Calendar, Clock, Trash2, ChevronRight, ArrowRight
} from 'lucide-react';

const SUBJECTS = [
  { id: 'islamic', name: 'الإسلامية', color: 'from-emerald-500 to-teal-600' },
  { id: 'math', name: 'الرياضيات', color: 'from-blue-500 to-indigo-600' },
  { id: 'physics', name: 'الفيزياء', color: 'from-purple-500 to-pink-600' },
  { id: 'chemistry', name: 'الكيمياء', color: 'from-orange-500 to-red-600' },
  { id: 'biology', name: 'الأحياء', color: 'from-green-500 to-emerald-600' },
  { id: 'arabic', name: 'العربي', color: 'from-amber-500 to-orange-600' },
  { id: 'english', name: 'الإنكليزي', color: 'from-cyan-500 to-blue-600' }
];

const POMODORO_MODES = [
  { duration: 30, break: 5, label: '30 د / 5 د راحة' },
  { duration: 60, break: 10, label: '60 د / 10 د راحة' },
  { duration: 120, break: 15, label: '120 د / 15 د راحة' }
];

export default function StudentProgressTracker() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Record<string, any>>({});
  const [tasks, setTasks] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(0);
  const [pomodoroMode, setPomodoroMode] = useState(0);
  const [isPomodoroBrk, setIsPomodoroBrk] = useState(false);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [newAchievement, setNewAchievement] = useState('');
  const [newTask, setNewTask] = useState({ title: '', subject: 'islamic' });
  const [newLesson, setNewLesson] = useState('');

  // ✅ Load data safely using localStorage (no window.storage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const subjectsData = localStorage.getItem('subjects');
      const tasksData = localStorage.getItem('tasks');
      const streakData = localStorage.getItem('streak');
      const lastDateData = localStorage.getItem('lastActiveDate');

      if (subjectsData) {
        setSubjects(JSON.parse(subjectsData));
      } else {
        const initialSubjects: Record<string, any> = {};
        SUBJECTS.forEach(s => {
          initialSubjects[s.id] = { progress: 0, lessons: [], achievements: [] };
        });
        setSubjects(initialSubjects);
      }

      if (tasksData) setTasks(JSON.parse(tasksData));
      if (streakData) setStreak(parseInt(streakData));
      if (lastDateData) setLastActiveDate(lastDateData);

      updateStreak(lastDateData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // ✅ Save data safely
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('subjects', JSON.stringify(subjects));
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('streak', streak.toString());
      if (lastActiveDate) {
        localStorage.setItem('lastActiveDate', lastActiveDate);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [subjects, tasks, streak, lastActiveDate]);

  // ✅ Pomodoro logic (unchanged)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            setPomodoroRunning(false);
            setIsPomodoroBrk(!isPomodoroBrk);
            const nextTime = !isPomodoroBrk
              ? POMODORO_MODES[pomodoroMode].break * 60
              : POMODORO_MODES[pomodoroMode].duration * 60;
            return nextTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime, isPomodoroBrk, pomodoroMode]);

  const updateStreak = (lastDate: string | null) => {
    const today = new Date().toDateString();
    if (!lastDate) {
      setStreak(1);
      setLastActiveDate(today);
    } else if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(1);
      }
      setLastActiveDate(today);
    }
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }]);
      setNewTask({ title: '', subject: 'islamic' });
      setShowAddTask(false);
      updateStreak(lastActiveDate);
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    updateStreak(lastActiveDate);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateProgress = (subjectId, value) => {
    setSubjects({
      ...subjects,
      [subjectId]: { 
        ...subjects[subjectId], 
        progress: Math.min(100, Math.max(0, parseInt(value) || 0))
      }
    });
  };

  const addLesson = (subjectId) => {
    if (newLesson.trim()) {
      const subjectData = subjects[subjectId] || { progress: 0, lessons: [], achievements: [] };
      setSubjects({
        ...subjects,
        [subjectId]: {
          ...subjectData,
          lessons: [...subjectData.lessons, { id: Date.now(), title: newLesson, completed: false }]
        }
      });
      setNewLesson('');
    }
  };

  const toggleLesson = (subjectId, lessonId) => {
    const subjectData = subjects[subjectId];
    setSubjects({
      ...subjects,
      [subjectId]: {
        ...subjectData,
        lessons: subjectData.lessons.map(l => 
          l.id === lessonId ? { ...l, completed: !l.completed } : l
        )
      }
    });
  };

  const deleteLesson = (subjectId, lessonId) => {
    const subjectData = subjects[subjectId];
    setSubjects({
      ...subjects,
      [subjectId]: {
        ...subjectData,
        lessons: subjectData.lessons.filter(l => l.id !== lessonId)
      }
    });
  };

  const addAchievement = (subjectId) => {
    if (newAchievement.trim()) {
      const subjectData = subjects[subjectId] || { progress: 0, lessons: [], achievements: [] };
      setSubjects({
        ...subjects,
        [subjectId]: {
          ...subjectData,
          achievements: [...subjectData.achievements, { id: Date.now(), text: newAchievement }]
        }
      });
      setNewAchievement('');
    }
  };

  const deleteAchievement = (subjectId, achievementId) => {
    const subjectData = subjects[subjectId];
    setSubjects({
      ...subjects,
      [subjectId]: {
        ...subjectData,
        achievements: subjectData.achievements.filter(a => a.id !== achievementId)
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startPomodoro = (mode) => {
    setPomodoroMode(mode);
    setPomodoroTime(POMODORO_MODES[mode].duration * 60);
    setIsPomodoroBrk(false);
    setPomodoroRunning(true);
  };

  if (selectedSubject) {
    const subject = SUBJECTS.find(s => s.id === selectedSubject);
    const subjectData = subjects[selectedSubject] || { progress: 0, lessons: [], achievements: [] };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة للنظرة العامة</span>
          </button>

          <div className="text-center mb-8">
            <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${subject.color} bg-clip-text text-transparent`}>
              {subject.name}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-6xl font-bold text-orange-400">
                {subjectData.progress}%
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm text-gray-400">تعديل التقدم:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={subjectData.progress}
                  onChange={(e) => updateProgress(selectedSubject, e.target.value)}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={subjectData.progress}
                  onChange={(e) => updateProgress(selectedSubject, e.target.value)}
                  className="w-16 bg-gray-700 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${subject.color} transition-all duration-500`}
                  style={{ width: `${subjectData.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-400" />
              الدروس الأساسية
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="أضف درساً جديداً..."
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLesson(selectedSubject)}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button
                onClick={() => addLesson(selectedSubject)}
                className="bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {subjectData.lessons.length === 0 ? (
                <p className="text-center text-gray-400 py-8">لم تضف أي دروس بعد</p>
              ) : (
                subjectData.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      lesson.completed 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleLesson(selectedSubject, lesson.id)}
                      className="flex-shrink-0"
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-orange-400 transition-colors" />
                      )}
                    </button>
                    <span className={`flex-1 ${lesson.completed ? 'line-through text-gray-500' : ''}`}>
                      {lesson.title}
                    </span>
                    <button
                      onClick={() => deleteLesson(selectedSubject, lesson.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              الإنجازات
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="سجل إنجازك هنا..."
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAchievement(selectedSubject)}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button
                onClick={() => addAchievement(selectedSubject)}
                className="bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {subjectData.achievements.length === 0 ? (
                <p className="text-center text-gray-400 py-8">ابدأ بتسجيل إنجازاتك لتشعر بالتحفيز!</p>
              ) : (
                subjectData.achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-lg"
                  >
                    <span className="text-orange-400 mt-1">•</span>
                    <span className="flex-1">{achievement.text}</span>
                    <button
                      onClick={() => deleteAchievement(selectedSubject, achievement.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                متتبع التقدم الدراسي
              </h1>
              <p className="text-gray-400 mt-2">السادس الإعدادي - سنة التحدي والنجاح</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-6 py-3 rounded-xl border border-orange-500/30">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">أيام متتالية</p>
                <p className="text-2xl font-bold text-orange-400">{streak}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-800/50 p-2 rounded-xl backdrop-blur">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BookOpen },
            { id: 'tasks', label: 'المهام اليومية', icon: CheckCircle2 },
            { id: 'pomodoro', label: 'بومودورو', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS.map(subject => {
                const data = subjects[subject.id] || { progress: 0, lessons: [], achievements: [] };
                const completedLessons = data.lessons.filter(l => l.completed).length;
                const totalLessons = data.lessons.length;
                
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/50 transition-all text-right group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{subject.name}</h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">التقدم</span>
                        <span className="text-2xl font-bold text-orange-400">{data.progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${subject.color} transition-all duration-500 rounded-full`}
                          style={{ width: `${data.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">الدروس المكتملة</span>
                      <span className="font-medium">{completedLessons} / {totalLessons}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold mb-6">مقارنة التقدم بين المواد</h3>
              <div className="space-y-4">
                {SUBJECTS.map(subject => {
                  const data = subjects[subject.id] || { progress: 0, lessons: [], achievements: [] };
                  
                  return (
                    <div key={subject.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-orange-400 font-bold">{data.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${subject.color} transition-all duration-500`}
                          style={{ width: `${data.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">المهام اليومية</h2>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                إضافة مهمة
              </button>
            </div>

            {showAddTask && (
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">مهمة جديدة</h3>
                  <button onClick={() => setShowAddTask(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="عنوان المهمة"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addTask}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-600 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    إضافة المهمة
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مهام بعد. ابدأ بإضافة مهمة جديدة!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-gray-800/50 backdrop-blur rounded-xl p-4 border transition-all ${
                      task.completed ? 'border-green-500/30 opacity-60' : 'border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-orange-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium mb-2 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <span className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm">
                          {SUBJECTS.find(s => s.id === task.subject)?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-gray-700/50 text-center">
              <h2 className="text-2xl font-bold mb-6">مؤقت بومودورو</h2>
              
              {pomodoroTime === 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-400 mb-6">اختر مدة الدراسة</p>
                  {POMODORO_MODES.map((mode, index) => (
                    <button
                      key={index}
                      onClick={() => startPomodoro(index)}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-600 py-4 rounded-xl hover:shadow-lg transition-all font-medium text-lg"
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-2">
                      {isPomodoroBrk ? 'استراحة' : 'وقت الدراسة'}
                    </div>
                    <div className="text-7xl font-bold text-orange-400 mb-4">
                      {formatTime(pomodoroTime)}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setPomodoroRunning(!pomodoroRunning)}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                    >
                      {pomodoroRunning ? (
                        <>
                          <Pause className="w-5 h-5" />
                          <span>إيقاف</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>بدء</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPomodoroTime(0);
                        setPomodoroRunning(false);
                        setIsPomodoroBrk(false);
                      }}
                      className="flex items-center gap-2 bg-gray-700 px-6 py-3 rounded-xl hover:bg-gray-600 transition-all"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>إعادة ضبط</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl p-6 border border-orange-500/20">
              <h3 className="font-bold mb-3 text-orange-400">💡 نصائح بومودورو</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• ركز تماماً على مادة واحدة خلال الجلسة</li>
                <li>• أغلق جميع المشتتات (الهاتف، الإشعارات)</li>
                <li>• استخدم فترة الراحة للتمدد والابتعاد عن الشاشة</li>
                <li>• اشرب الماء وخذ نفساً عميقاً</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}