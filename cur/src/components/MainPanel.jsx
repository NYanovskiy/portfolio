import React from 'react';
import Calendar from './Calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MainPanel = ({ tasks, habits, selectedDate, onDateChange, onAchievement }) => {
  return (
    <div className="card">
      <h3>Календарь на {format(selectedDate, 'MMMM yyyy', { locale: ru })}</h3>
      
      <Calendar 
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        tasks={tasks}
        habits={habits}
        onAchievement={onAchievement}
      />
      
      <div style={{ 
        marginTop: 16,
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-around',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '10px', 
              height: '10px', 
              background: 'linear-gradient(135deg, var(--green) 0%, #32d74b 100%)',
              borderRadius: '50%'
            }}
          ></div>
          <span>Высокая продуктивность</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '10px', 
              height: '10px', 
              background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%)',
              borderRadius: '50%'
            }}
          ></div>
          <span>Средняя продуктивность</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '10px', 
              height: '10px', 
              background: 'linear-gradient(135deg, var(--red) 0%, #ff6b6b 100%)',
              borderRadius: '50%'
            }}
          ></div>
          <span>Низкая продуктивность</span>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;