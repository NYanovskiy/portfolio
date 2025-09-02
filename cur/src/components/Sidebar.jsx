import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Calendar from './Calendar';

const Sidebar = ({ tasks, selectedDate, onDateChange, pomodoros, habits = [], onAchievement }) => {
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

  return (
    <div>
      <div className="card">
        <h4>Прогресс</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="muted">Сегодня ({format(selectedDate, 'dd MMM', { locale: ru })})</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
              {completedTasksForDate}/{totalTasksForDate}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              {completionPercentage}% выполнено
            </div>
          </div>

          <div>
            <div className="muted">Всего задач</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
              {completedTasks}/{totalTasks}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              {overallPercentage}% выполнено
            </div>
          </div>

          <div>
            <div className="muted">🍅 Помидорки сегодня</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-2)' }}>
              {todayPomodoros}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Всего: {totalPomodoros}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
