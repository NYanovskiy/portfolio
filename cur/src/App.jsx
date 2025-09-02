import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { load, save, STORAGE } from './utils/storage';
import { useTheme } from './hooks/useTheme';

import Header from './components/Header';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

import HabitForm from './components/HabitForm';
import HabitList from './components/HabitList';
import Settings from './components/Settings';
import PomodoroTimer from './components/PomodoroTimer';
import Statistics from './components/Statistics';
import VictoryAnimation from './components/VictoryAnimation';

import './index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [pomodoros, setPomodoros] = useState([]);
  const [theme, setTheme] = useState('light');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [achievement, setAchievement] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
  const [habitForm, setHabitForm] = useState({ title: '', cadence: 'daily' });

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = load(STORAGE.TASKS, []);
    const savedHabits = load(STORAGE.HABITS, []);
    const savedPomodoros = load(STORAGE.POMODOROS, []);
    const savedTheme = load(STORAGE.THEME, 'light');
    
    setTasks(savedTasks);
    setHabits(savedHabits);
    setPomodoros(savedPomodoros);
    setTheme(savedTheme);
  }, []);

  // Apply theme
  useTheme(theme);

  // Control main page scroll when modals are open
  useEffect(() => {
    const isAnyModalOpen = settingsOpen || pomodoroOpen || statisticsOpen;
    
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [settingsOpen, pomodoroOpen, statisticsOpen]);

  // Save data to localStorage
  const saveData = (newTasks, newHabits, newPomodoros, newTheme) => {
    save(STORAGE.TASKS, newTasks);
    save(STORAGE.HABITS, newHabits);
    save(STORAGE.POMODOROS, newPomodoros);
    save(STORAGE.THEME, newTheme);
  };

  // Task actions
  const addTask = () => {
    if (!taskForm.title.trim()) return;
    
    const newTask = {
      id: uuidv4(),
      title: taskForm.title,
      datetime: taskForm.date,
      completed: false
    };
    
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    setTaskForm({ title: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
    saveData(newTasks, habits, pomodoros, theme);
  };

  const toggleTask = (taskId) => {
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    saveData(newTasks, habits, pomodoros, theme);
  };

  const removeTask = (taskId) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    setTasks(newTasks);
    saveData(newTasks, habits, pomodoros, theme);
  };

  // Habit actions
  const addHabit = () => {
    if (!habitForm.title.trim()) return;
    
    const newHabit = {
      id: uuidv4(),
      title: habitForm.title,
      cadence: habitForm.cadence,
      completedDates: []
    };
    
    const newHabits = [...habits, newHabit];
    setHabits(newHabits);
    setHabitForm({ title: '', cadence: 'daily' });
    saveData(tasks, newHabits, pomodoros, theme);
  };

  const toggleHabit = (habitId) => {
    const today = format(selectedDate, 'yyyy-MM-dd');
    const newHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates || [];
        const isCompleted = completedDates.includes(today);
        
        if (isCompleted) {
          return {
            ...habit,
            completedDates: completedDates.filter(date => date !== today)
          };
        } else {
          return {
            ...habit,
            completedDates: [...completedDates, today]
          };
        }
      }
      return habit;
    });
    
    setHabits(newHabits);
    saveData(tasks, newHabits, pomodoros, theme);
  };

  const removeHabit = (habitId) => {
    const newHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(newHabits);
    saveData(tasks, newHabits, pomodoros, theme);
  };

  // Pomodoro actions
  const handlePomodoroComplete = (count) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newPomodoro = {
      id: uuidv4(),
      date: today,
      count: count
    };
    
    const newPomodoros = [...pomodoros, newPomodoro];
    setPomodoros(newPomodoros);
    saveData(tasks, habits, newPomodoros, theme);
  };

  // Settings actions
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    saveData(tasks, habits, pomodoros, newTheme);
  };

  const fillSampleData = () => {
    const sampleTasks = [
      { id: uuidv4(), title: 'Изучить React', datetime: format(new Date(), "yyyy-MM-dd'T'09:00"), completed: true },
      { id: uuidv4(), title: 'Сделать упражнения', datetime: format(new Date(), "yyyy-MM-dd'T'18:00"), completed: false },
      { id: uuidv4(), title: 'Прочитать книгу', datetime: format(new Date(), "yyyy-MM-dd'T'20:00"), completed: false }
    ];
    
    const sampleHabits = [
      { id: uuidv4(), title: 'Утренняя зарядка', cadence: 'daily', completedDates: [format(new Date(), 'yyyy-MM-dd')] },
      { id: uuidv4(), title: 'Пить воду', cadence: 'daily', completedDates: [] },
      { id: uuidv4(), title: 'Уборка дома', cadence: 'weekly', completedDates: [] }
    ];

    const samplePomodoros = [
      { id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), count: 3 }
    ];
    
    setTasks(sampleTasks);
    setHabits(sampleHabits);
    setPomodoros(samplePomodoros);
    saveData(sampleTasks, sampleHabits, samplePomodoros, theme);
  };

  const resetData = () => {
    setTasks([]);
    setHabits([]);
    setPomodoros([]);
    saveData([], [], [], theme);
  };

  // Date change handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Update task form date when calendar date is clicked
    setTaskForm(prev => ({
      ...prev,
      date: format(date, "yyyy-MM-dd'T'HH:mm")
    }));
  };
  
  // Achievement handler
  const handleAchievement = (achievementData) => {
    setAchievement(achievementData);
  };
  
  // Close achievement animation
  const closeAchievement = () => {
    setAchievement(null);
  };

  // Get today's pomodoros
  const todayPomodoros = pomodoros.filter(p => p.date === format(new Date(), 'yyyy-MM-dd')).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'transparent', 
      color: 'var(--text)',
      padding: '12px'
    }}>
      <div className="container">
        <Header 
          onSettingsClick={() => setSettingsOpen(true)}
          tasks={tasks}
          habits={habits}
          pomodoros={pomodoros}
          selectedDate={selectedDate}
        />
        
        {/* Quick Actions Bar */}
        <div className="quick-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setPomodoroOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8
            }}
          >
            🍅 Помодоро
            {todayPomodoros > 0 && (
              <span className="badge">{todayPomodoros}</span>
            )}
          </button>
          
          <button 
            className="btn"
            onClick={() => setStatisticsOpen(true)}
          >
            📊 Статистика
          </button>
        </div>
        
        <div className="simple-grid">
          {/* Left: Calendar and Progress */}
          <div className="sidebar-panel">
            <div className="card">
              <h3>📅 {format(selectedDate, 'MMMM yyyy', { locale: ru })}</h3>
              <Calendar 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                tasks={tasks}
                habits={habits}
                onAchievement={handleAchievement}
              />
            </div>
          </div>
          
          {/* Right: Today's Work */}
          <div className="main-panel">
            <div className="card">
              <h2>✅ План на {format(selectedDate, 'dd MMMM', { locale: ru })}</h2>
              
              <TaskForm 
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                onSubmit={addTask}
              />
              
              <TaskList 
                tasks={tasks}
                selectedDate={selectedDate}
                onToggleTask={toggleTask}
                onRemoveTask={removeTask}
              />
            </div>
            
            <div className="card habits-section">
              <h3>🔄 Привычки</h3>
              
              <HabitForm 
                habitForm={habitForm}
                setHabitForm={setHabitForm}
                onSubmit={addHabit}
              />
              
              <HabitList 
                habits={habits}
                selectedDate={selectedDate}
                onToggleHabit={toggleHabit}
                onRemoveHabit={removeHabit}
              />
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <Settings 
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          onThemeChange={handleThemeChange}
          onFillSample={fillSampleData}
          onReset={resetData}
        />

        <PomodoroTimer 
          isOpen={pomodoroOpen}
          onClose={() => setPomodoroOpen(false)}
          onPomodoroComplete={handlePomodoroComplete}
        />

        <Statistics 
          isOpen={statisticsOpen}
          onClose={() => setStatisticsOpen(false)}
          tasks={tasks}
          habits={habits}
          pomodoros={pomodoros}
        />
        
        <VictoryAnimation 
          achievement={achievement}
          onClose={closeAchievement}
        />
      </div>
    </div>
  );
}

export default App;