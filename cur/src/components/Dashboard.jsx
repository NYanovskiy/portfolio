import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = ({ tasks, habits, pomodoros, selectedDate }) => {
  // Calculate statistics for selected date
  const tasksForSelectedDate = tasks.filter(task => {
    const taskDate = new Date(task.datetime);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  const completedTasksForDate = tasksForSelectedDate.filter(task => task.completed).length;
  const totalTasksForDate = tasksForSelectedDate.length;
  const completionPercentage = totalTasksForDate > 0 ? Math.round((completedTasksForDate / totalTasksForDate) * 100) : 0;

  // Overall statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Pomodoro statistics
  const todayPomodoros = pomodoros?.filter(p => p.date === format(new Date(), 'yyyy-MM-dd')).length || 0;
  const totalPomodoros = pomodoros?.length || 0;
  
  // Habit statistics
  const totalHabits = habits.length;
  const today = format(selectedDate, 'yyyy-MM-dd');
  const completedHabitsToday = habits.filter(h => (h.completedDates || []).includes(today)).length;
  const habitCompletionPercentage = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;

  return (
    <div className="simple-dashboard">
      <div className="stat-row">
        <div className="simple-stat">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{completedTasksForDate}/{totalTasksForDate}</div>
            <div className="stat-label">Задачи сегодня</div>
          </div>
        </div>

        <div className="simple-stat">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-number">{completedHabitsToday}/{totalHabits}</div>
            <div className="stat-label">Привычки</div>
          </div>
        </div>

        <div className="simple-stat">
          <div className="stat-icon">🍅</div>
          <div className="stat-content">
            <div className="stat-number">{todayPomodoros}</div>
            <div className="stat-label">Помодоро</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;