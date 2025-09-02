import React from 'react';
import { format } from 'date-fns';

const TaskForm = ({ taskForm, setTaskForm, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleClear = () => {
    setTaskForm({ title: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="task-form-inline" 
      style={{ 
        marginTop: 16,
        display: 'flex',
        gap: 12,
        alignItems: 'stretch',
        width: '100%'
      }}
    >
      <input
        value={taskForm.title}
        onChange={(e) => setTaskForm(f => ({ ...f, title: e.target.value }))}
        placeholder="Новая задача..."
        style={{ 
          flex: '1.8',
          minWidth: 0
        }}
      />
      
      <input
        type="datetime-local"
        value={taskForm.date}
        onChange={(e) => setTaskForm(f => ({ ...f, date: e.target.value }))}
        style={{ 
          flex: '1',
          minWidth: '190x'
        }}
      />
      
      <div style={{
        display: 'flex',
        gap: 8
      }}>
        <button
          className="btn btn-orange"
          type="submit"
          disabled={!taskForm.title.trim()}
          style={{ 
            flexShrink: 0,
            minWidth: '90px'
          }}
        >
          Добавить
        </button>
        
        <button
          className="btn"
          type="button"
          onClick={handleClear}
          style={{ 
            flexShrink: 0,
            minWidth: '80px'
          }}
        >
          Очистить
        </button>
      </div>
    </form>
  );
};

export default TaskForm;