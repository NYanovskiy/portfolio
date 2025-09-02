import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

const PomodoroTimer = ({ isOpen, onClose, onPomodoroComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [currentSession, setCurrentSession] = useState(1);
  const intervalRef = useRef(null);

  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes
  const LONG_BREAK_TIME = 15 * 60; // 15 minutes

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            if (!isBreak) {
              // Work session completed
              const newPomodoros = pomodorosCompleted + 1;
              setPomodorosCompleted(newPomodoros);
              onPomodoroComplete && onPomodoroComplete(newPomodoros);
              
              // Check if it's time for a long break
              if (currentSession % 4 === 0) {
                setTimeLeft(LONG_BREAK_TIME);
                setIsBreak(true);
              } else {
                setTimeLeft(BREAK_TIME);
                setIsBreak(true);
              }
            } else {
              // Break completed
              setTimeLeft(WORK_TIME);
              setIsBreak(false);
              setCurrentSession(prev => prev + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, pomodorosCompleted, currentSession, onPomodoroComplete]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(WORK_TIME);
    setIsBreak(false);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (isBreak) {
      setTimeLeft(WORK_TIME);
      setIsBreak(false);
      setCurrentSession(prev => prev + 1);
    } else {
      const newPomodoros = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodoros);
      onPomodoroComplete && onPomodoroComplete(newPomodoros);
      
      if (currentSession % 4 === 0) {
        setTimeLeft(LONG_BREAK_TIME);
        setIsBreak(true);
      } else {
        setTimeLeft(BREAK_TIME);
        setIsBreak(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isBreak ? (isBreak === 'long' ? LONG_BREAK_TIME : BREAK_TIME) : WORK_TIME) - timeLeft) / (isBreak ? (isBreak === 'long' ? LONG_BREAK_TIME : BREAK_TIME) : WORK_TIME) * 100;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pomodoro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card pomodoro-card" style={{ border: 'none', boxShadow: 'none', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.5rem',
              color: '#dc2626',
              textShadow: '0 0 10px rgba(220, 38, 38, 0.3)'
            }}>🍅 Таймер Помодоро</h3>
            <button 
              className="btn pomodoro-close-btn" 
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

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              color: isBreak ? '#22c55e' : '#dc2626',
              marginBottom: 8,
              fontFamily: 'monospace',
              textShadow: isBreak ? '0 0 20px rgba(34, 197, 94, 0.5)' : '0 0 20px rgba(220, 38, 38, 0.5)'
            }}>
              {formatTime(timeLeft)}
            </div>
            
            <div style={{ 
              fontSize: '1.125rem', 
              color: 'var(--muted)',
              marginBottom: 16
            }}>
              {isBreak ? 'Перерыв' : 'Работа'} • Сессия {currentSession}
            </div>

            {/* Progress ring */}
            <div style={{ 
              position: 'relative', 
              width: '120px', 
              height: '120px', 
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(220, 38, 38, 0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={isBreak ? '#22c55e' : '#dc2626'}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ 
                    transition: 'stroke-dashoffset 1s linear',
                    filter: isBreak ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' : 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.6))'
                  }}
                />
              </svg>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
              {!isRunning ? (
                <button className="btn pomodoro-start-btn" onClick={startTimer}>
                  ▶️ Начать
                </button>
              ) : (
                <button className="btn pomodoro-pause-btn" onClick={pauseTimer}>
                  ⏸️ Пауза
                </button>
              )}
              
              <button className="btn pomodoro-secondary-btn" onClick={resetTimer}>
                🔄 Сброс
              </button>
              
              <button className="btn pomodoro-secondary-btn" onClick={skipTimer}>
                ⏭️ Пропустить
              </button>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 16,
              padding: '16px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(220, 38, 38, 0.3)'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
                  {pomodorosCompleted}
                </div>
                <div className="muted">Помидорок сегодня</div>
              </div>
              
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
                  {currentSession}
                </div>
                <div className="muted">Текущая сессия</div>
              </div>
            </div>

            {/* Tips */}
            <div style={{ 
              marginTop: 16, 
              padding: '12px', 
              background: 'rgba(220, 38, 38, 0.1)', 
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--muted)',
              border: '1px solid rgba(220, 38, 38, 0.2)'
            }}>
              💡 Совет: После 4 помидорок делайте длинный перерыв 15 минут
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
