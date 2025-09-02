import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

const HabitList = ({ habits, selectedDate, onToggleHabit, onRemoveHabit }) => {
  const [pulsingHabits, setPulsingHabits] = useState(new Set());
  
  const handleToggleHabit = (habitId) => {
    // Add pulse effect
    setPulsingHabits(prev => new Set([...prev, habitId]));
    
    // Remove pulse effect after animation
    setTimeout(() => {
      setPulsingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }, 600);
    
    onToggleHabit(habitId);
  };
  const calculateHabitPercent = (habit) => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const completedDates = habit.completedDates || [];
      const monthRecords = completedDates.filter(date => {
        const recordDate = new Date(date);
        return recordDate >= startOfMonth && recordDate <= endOfMonth;
      }).length;
      
      const daysInMonth = endOfMonth.getDate();
      
      if (habit.cadence === 'daily') {
        return Math.min(100, Math.round((monthRecords / daysInMonth) * 100));
      } else {
        const weeksInMonth = Math.ceil(daysInMonth / 7);
        return Math.min(100, Math.round((monthRecords / weeksInMonth) * 100));
      }
    } catch {
      return 0;
    }
  };

  // Generate last 7 days data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'dd MMM', { locale: ru }),
      completed: habits.filter(habit => {
        const completedDates = habit.completedDates || [];
        return completedDates.includes(format(date, 'yyyy-MM-dd'));
      }).length
    };
  });

  return (
    <div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {habits.length === 0 && <div className="muted">Нет привычек — добавьте.</div>}
        
        {habits.map(habit => {
          const percent = calculateHabitPercent(habit);
          const today = format(selectedDate, 'yyyy-MM-dd');
          const completedDates = habit.completedDates || [];
          const checked = completedDates.includes(today);
          
          return (
            <div
              key={habit.id}
              style={{
                borderRadius: 12,
                padding: 10,
                border: '1px solid rgba(0,0,0,0.04)',
                background: 'var(--card)',
                transition: 'transform 200ms ease, box-shadow 200ms ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                  <input
                    className={`checkbox ${pulsingHabits.has(habit.id) ? 'pulse' : ''}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleHabit(habit.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{habit.title}</div>
                    <div className="muted" style={{ fontSize: '0.875rem' }}>
                      {habit.cadence === 'daily' ? 'Ежедневно' : 'Еженедельно'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{percent}%</div>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>этот месяц</div>
                </div>
              </div>

              <div style={{
                height: 8,
                background: 'rgba(0,0,0,0.04)',
                borderRadius: 8,
                overflow: 'hidden',
                marginTop: 12
              }}>
                <div style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  transition: 'width 300ms ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div>
                  <button
                    className="btn btn-delete"
                    onClick={() => onRemoveHabit(habit.id)}
                    title="Удалить привычку"
                  >
                  </button>
                </div>
                <div className="muted" style={{ fontSize: '0.875rem' }}>
                  {completedDates.length} отметок
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="muted" style={{ marginBottom: 8 }}>Активность (7 дней)</div>
          <div style={{ height: 120 }}>
            <ResponsiveContainer>
              <BarChart data={last7Days} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barG2" x1="0" x2="1">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--accent-2)" />
                  </linearGradient>
                </defs>
                <Bar dataKey="completed" radius={[6, 6, 6, 6]} fill="url(#barG2)" barSize={12} />
                <XAxis dataKey="date" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitList;
