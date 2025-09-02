import React, { useState } from 'react';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

const Statistics = ({ isOpen, onClose, tasks, habits, pomodoros }) => {
  const [period, setPeriod] = useState('month'); // 'month' or 'year'

  if (!isOpen) return null;

  // Generate data for the selected period
  const generateData = () => {
    const today = new Date();
    
    if (period === 'month') {
      const startDate = startOfMonth(today);
      const endDate = endOfMonth(today);
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.datetime);
          return taskDate.toDateString() === day.toDateString();
        });
        
        const completedTasks = dayTasks.filter(task => task.completed).length;
        const totalTasks = dayTasks.length;
        
        const dayHabits = habits.filter(habit => {
          const completedDates = habit.completedDates || [];
          return completedDates.includes(dayStr);
        }).length;
        
        const dayPomodoros = pomodoros?.filter(p => {
          const pomodoroDate = new Date(p.date);
          return pomodoroDate.toDateString() === day.toDateString();
        }).length || 0;
        
        return {
          date: format(day, 'dd MMM', { locale: ru }),
          fullDate: dayStr,
          tasks: totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          habits: dayHabits,
          pomodoros: dayPomodoros
        };
      });
    } else {
      // Year data - monthly aggregation
      const startDate = new Date(today.getFullYear(), 0, 1);
      const endDate = today;
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthTasks = tasks.filter(task => {
          const taskDate = new Date(task.datetime);
          return taskDate >= monthStart && taskDate <= monthEnd;
        });
        
        const completedTasks = monthTasks.filter(task => task.completed).length;
        const totalTasks = monthTasks.length;
        
        const monthHabits = habits.reduce((total, habit) => {
          const completedDates = habit.completedDates || [];
          const monthHabitCount = completedDates.filter(date => {
            const habitDate = new Date(date);
            return habitDate >= monthStart && habitDate <= monthEnd;
          }).length;
          return total + monthHabitCount;
        }, 0);
        
        const monthPomodoros = pomodoros?.filter(p => {
          const pomodoroDate = new Date(p.date);
          return pomodoroDate >= monthStart && pomodoroDate <= monthEnd;
        }).length || 0;
        
        return {
          date: format(month, 'MMM yyyy', { locale: ru }),
          fullDate: format(month, 'yyyy-MM'),
          tasks: totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          habits: monthHabits,
          pomodoros: monthPomodoros
        };
      });
    }
  };

  const data = generateData();

  // Calculate overall statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalHabits = habits.length;
  const totalPomodoros = pomodoros?.length || 0;
  
  const totalHabitCompletions = habits.reduce((total, habit) => {
    return total + (habit.completedDates?.length || 0);
  }, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.1))',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 8px 24px rgba(11, 18, 32, 0.15)',
          backdropFilter: 'blur(10px)',
          fontFamily: 'var(--font-family)'
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontWeight: '600', 
            color: 'var(--text)',
            fontSize: '0.875rem'
          }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: 'var(--muted)',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: entry.color, fontWeight: '500' }}>
                {entry.name}:
              </span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content statistics-window" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '110vw',
          height: '95vh',
          maxWidth: '1650px',
          maxHeight: '95vh',
          margin: '2.5vh auto'
        }}
      >
        <div className="card" style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          border: 'none',
          boxShadow: 'none',
          padding: '16px'
        }}>
          {/* Compact header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>📊 Статистика</h2>
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

          {/* Compact period selector and stats in one row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8
          }}>
            {/* Period selector */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className={`btn ${period === 'month' ? 'btn-primary' : ''}`}
                onClick={() => setPeriod('month')}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: period === 'month' ? '600' : '500'
                }}
              >
                Месяц
              </button>
              <button 
                className={`btn ${period === 'year' ? 'btn-primary' : ''}`}
                onClick={() => setPeriod('year')}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: period === 'year' ? '600' : '500'
                }}
              >
                Год
              </button>
            </div>

            {/* Compact stats row */}
            <div style={{ 
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent)' }}>
                  {completedTasks}/{totalTasks}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Задач</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--green)' }}>
                  {totalHabitCompletions}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Привычек</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-2)' }}>
                  {totalPomodoros}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Помидорок</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--yellow)' }}>
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Прогресс</div>
              </div>
            </div>
          </div>

          {/* Main scrollable content */}
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            overflowX: 'hidden',
            paddingRight: '8px'
          }}>
            {/* Compact charts grid */}
            <div style={{ 
              display: 'grid', 
              gap: 8, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              marginBottom: 12
            }}>
              {/* Tasks completion rate */}
              <div className="chart-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                  📈 Процент выполнения
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="var(--accent)" 
                      fill="url(#completionGradient)"
                      name="Процент выполнения"
                    />
                    <defs>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pomodoros */}
              <div className="chart-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                  🍅 Помидорки
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="pomodoros" 
                      fill="var(--accent-2)" 
                      radius={[4, 4, 0, 0]}
                      name="Помидорки"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tasks vs Completed */}
              <div className="chart-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                  ✅ Задачи: выполнено / всего
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="tasks" 
                      fill="var(--muted)" 
                      radius={[4, 4, 0, 0]}
                      name="Всего задач"
                    />
                    <Bar 
                      dataKey="completedTasks" 
                      fill="var(--green)" 
                      radius={[4, 4, 0, 0]}
                      name="Выполнено"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Habits activity */}
              <div className="chart-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                  🔄 Активность привычек
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="habits" 
                      stroke="var(--green)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--green)', strokeWidth: 2, r: 3 }}
                      name="Привычки"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compact summary table */}
            <div className="chart-card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                📋 Детальная таблица
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '250px', overflow: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--input-border)', position: 'sticky', top: 0, background: 'var(--card)' }}>
                      <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', fontSize: '0.8rem' }}>Дата</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', fontSize: '0.8rem' }}>Задач</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', fontSize: '0.8rem' }}>Выполнено</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', fontSize: '0.8rem' }}>%</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', fontSize: '0.8rem' }}>Привычки</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', fontSize: '0.8rem' }}>Помидорки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid var(--input-border)',
                        transition: 'background-color 0.2s ease'
                      }}>
                        <td style={{ padding: '6px', fontWeight: '500', color: 'var(--text)', fontSize: '0.75rem' }}>{row.date}</td>
                        <td style={{ padding: '6px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem' }}>{row.tasks}</td>
                        <td style={{ padding: '6px', textAlign: 'center', color: 'var(--green)', fontWeight: '500', fontSize: '0.75rem' }}>{row.completedTasks}</td>
                        <td style={{ padding: '6px', textAlign: 'center', color: 'var(--accent)', fontWeight: '500', fontSize: '0.75rem' }}>{row.completionRate}%</td>
                        <td style={{ padding: '6px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem' }}>{row.habits}</td>
                        <td style={{ padding: '6px', textAlign: 'center', color: 'var(--accent-2)', fontWeight: '500', fontSize: '0.75rem' }}>{row.pomodoros}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
