import React from 'react';
import Calendar from './Calendar';

const CalendarView = ({ isOpen, onClose, selectedDate, onDateChange, tasks, habits, onAchievement }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '400px' }}
      >
        <div className="card" style={{ border: 'none', boxShadow: 'none', padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24 
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>📅 Календарь</h3>
            <button 
              className="btn" 
              onClick={onClose}
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}
            >
              ✕
            </button>
          </div>

          <Calendar 
            selectedDate={selectedDate}
            onDateChange={(date) => {
              onDateChange(date);
              // Optionally close the modal after selecting a date
              // onClose();
            }}
            tasks={tasks}
            habits={habits}
            onAchievement={onAchievement}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarView;