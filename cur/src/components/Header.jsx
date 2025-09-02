import React from 'react';
import Dashboard from './Dashboard';

const Header = ({ onSettingsClick, tasks, habits, pomodoros, selectedDate }) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div style={{ flex: 1 }}>
        <Dashboard 
          tasks={tasks}
          habits={habits}
          pomodoros={pomodoros}
          selectedDate={selectedDate}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 16 }}>
        <div style={{ position: 'relative' }}>
          <button
            className="gear"
            onClick={onSettingsClick}
            title="Настройки"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

