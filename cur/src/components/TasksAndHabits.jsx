import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import HabitForm from './HabitForm';
import HabitList from './HabitList';

const TasksAndHabits = ({ 
  tasks, habits, selectedDate, 
  taskForm, setTaskForm, addTask,
  habitForm, setHabitForm, addHabit,
  toggleTask, removeTask, 
  toggleHabit, removeHabit 
}) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const taskFormRef = useRef(null);
  const habitFormRef = useRef(null);
  
  return (
    <div className="card tasks-habits-card">
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✓ Задачи
        </button>
        <button 
          className={`tab-button ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          🔄 Привычки
        </button>
      </div>
      
      {activeTab === 'tasks' && (
        <div>
          <h3>План на {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}</h3>
          
          <TaskForm 
            ref={taskFormRef}
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
      )}
      
      {activeTab === 'habits' && (
        <div>
          <h3>Привычки</h3>
          
          <HabitForm 
            ref={habitFormRef}
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
      )}
    </div>
  );
};

export default TasksAndHabits;