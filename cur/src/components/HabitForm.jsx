import React from 'react';

const HabitForm = ({ habitForm, setHabitForm, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="task-form-inline" 
      style={{ 
        marginTop: 16,
        marginBottom: 24,
        display: 'flex',
        gap: 12,
        alignItems: 'stretch',
        width: '100%'
      }}
    >
      <input
        value={habitForm.title}
        onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
        placeholder="Новая привычка..."
        style={{ 
          flex: 2,
          minWidth: 0
        }}
      />
      
      <select
        value={habitForm.cadence}
        onChange={(e) => setHabitForm({ ...habitForm, cadence: e.target.value })}
        style={{ 
          flex: 1,
          minWidth: '120px'
        }}
      >
        <option value="daily">Ежедневно</option>
        <option value="weekly">Еженедельно</option>
        <option value="monthly">Ежемесячно</option>
      </select>
      
      <button
        className="btn btn-orange"
        type="submit"
        disabled={!habitForm.title.trim()}
        style={{ 
          flexShrink: 0,
          minWidth: '100px'
        }}
      >
        Добавить
      </button>
    </form>
  );
};

export default HabitForm;
