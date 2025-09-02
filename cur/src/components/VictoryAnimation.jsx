import React, { useState, useEffect } from 'react';

const VictoryAnimation = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      generateConfetti();
      playVictorySound();
      
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for fade out animation
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  const generateConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        emoji: ['🎉', '⭐', '🌟', '✨', '🎊', '🏆', '💫'][Math.floor(Math.random() * 7)]
      });
    }
    setConfetti(newConfetti);
  };

  const playVictorySound = () => {
    // Create victory sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Victory melody notes
      const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C (octave)
      
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        const startTime = audioContext.currentTime + (index * 0.15);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const praises = [
    '🌟 Невероятно! Идеальный день!',
    '🎉 Потрясающий результат!',
    '⭐ Вы достигли совершенства!',
    '🏆 Выдающиеся достижения!',
    '✨ Фантастическая продуктивность!'
  ];

  const randomPraise = praises[Math.floor(Math.random() * praises.length)];

  if (!achievement || !isVisible) return null;

  return (
    <div className={`victory-overlay ${isVisible ? 'visible' : ''}`}>
      {/* Confetti */}
      {confetti.map(item => (
        <div
          key={item.id}
          className="confetti-item"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`
          }}
        >
          {item.emoji}
        </div>
      ))}
      
      {/* Main achievement card */}
      <div className="victory-card">
        <div className="victory-header">
          <div className="victory-icon">🏆</div>
          <h2 className="victory-title">{randomPraise}</h2>
        </div>
        
        <div className="victory-content">
          <div className="victory-date">
            📅 {achievement.date}
          </div>
          
          <div className="victory-stats">
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <span className="stat-label">Задачи:</span>
              <span className="stat-value">{achievement.stats.tasks}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">🔄</span>
              <span className="stat-label">Привычки:</span>
              <span className="stat-value">{achievement.stats.habits}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <span className="stat-label">Завершено:</span>
              <span className="stat-value">{achievement.stats.completion}</span>
            </div>
          </div>
          
          <div className="victory-message">
            Это был идеальный день! Вы выполнили все задачи и привычки. 
            Продолжайте в том же духе! 🌟
          </div>
        </div>
        
        <button 
          className="victory-close"
          onClick={() => setIsVisible(false)}
        >
          ✨ Продолжить ✨
        </button>
      </div>
    </div>
  );
};

export default VictoryAnimation;