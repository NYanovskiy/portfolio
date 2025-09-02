import React from 'react';

const BottomNav = ({ onOpenPomodoro, onOpenStatistics, onOpenSettings, todayPomodoros }) => {
  return (
    <div className="bottom-nav">
      <button 
        className="bottom-nav-item" 
        onClick={onOpenPomodoro}
        aria-label="Pomodoro Timer"
      >
        <div className="bottom-nav-icon">
          🍅
          {todayPomodoros > 0 && (
            <span className="bottom-nav-badge">{todayPomodoros}</span>
          )}
        </div>
        <div className="bottom-nav-label">Помодоро</div>
      </button>
      
      <button 
        className="bottom-nav-item" 
        onClick={onOpenStatistics}
        aria-label="Statistics"
      >
        <div className="bottom-nav-icon">📊</div>
        <div className="bottom-nav-label">Статистика</div>
      </button>
      
      <button 
        className="bottom-nav-item" 
        onClick={onOpenSettings}
        aria-label="Settings"
      >
        <div className="bottom-nav-icon">⚙️</div>
        <div className="bottom-nav-label">Настройки</div>
      </button>
    </div>
  );
};

export default BottomNav;