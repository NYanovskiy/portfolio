import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { safeParse } from '../utils/dateUtils';

const TaskList = ({ tasks, selectedDate, onToggleTask, onRemoveTask }) => {
  const [pulsingTasks, setPulsingTasks] = useState(new Set());
  
  const handleToggleTask = (taskId) => {
    // Add pulse effect
    setPulsingTasks(prev => new Set([...prev, taskId]));
    
    // Remove pulse effect after animation
    setTimeout(() => {
      setPulsingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 600);
    
    onToggleTask(taskId);
  };
  const tasksForDate = tasks.filter(t => {
    const d = safeParse(t.datetime);
    return d ? isSameDay(d, selectedDate) : false;
  });

  const todayTasks = tasks.filter(t => {
    const d = safeParse(t.datetime);
    return d ? isSameDay(d, new Date()) : false;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
      <div>
        <h4>Задачи</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasksForDate.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.04)',
                minHeight: 60
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 0 }}>
                <input
                  className={`checkbox ${pulsingTasks.has(task.id) ? 'pulse' : ''}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    wordBreak: 'break-word'
                  }}>
                    {task.title}
                  </div>
                  <div className="muted">
                    {safeParse(task.datetime) ? format(safeParse(task.datetime), 'HH:mm') : '-'}
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0, marginLeft: 8 }}>
                <button
                  className="btn btn-delete"
                  onClick={() => onRemoveTask(task.id)}
                  title="Удалить задачу"
                >
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4>Сегодня</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todayTasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: 10,
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.04)',
                minHeight: 60
              }}
            >
              <input
                className={`checkbox ${pulsingTasks.has(task.id) ? 'pulse' : ''}`}
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  wordBreak: 'break-word'
                }}>
                  {task.title}
                </div>
                <div className="muted">
                  {safeParse(task.datetime) ? format(safeParse(task.datetime), 'HH:mm') : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
