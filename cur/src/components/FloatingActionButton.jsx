import React, { useState } from 'react';

const FloatingActionButton = ({ onAddTask, onAddHabit }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleAddTask = () => {
    onAddTask();
    setIsOpen(false);
  };
  
  const handleAddHabit = () => {
    onAddHabit();
    setIsOpen(false);
  };
  
  return (
    <div className="fab-container">
      {isOpen && (
        <div className="fab-menu">
          <button 
            className="fab-item" 
            onClick={handleAddTask}
            aria-label="Add Task"
          >
            <span className="fab-icon">✓</span>
            <span className="fab-label">Добавить задачу</span>
          </button>
          
          <button 
            className="fab-item" 
            onClick={handleAddHabit}
            aria-label="Add Habit"
          >
            <span className="fab-icon">🔄</span>
            <span className="fab-label">Добавить привычку</span>
          </button>
        </div>
      )}
      
      <button 
        className={`fab-main ${isOpen ? 'fab-open' : ''}`}
        onClick={toggleMenu}
        aria-label="Add Item"
        aria-expanded={isOpen}
      >
        {isOpen ? '×' : '+'}
      </button>
    </div>
  );
};

export default FloatingActionButton;