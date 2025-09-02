import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

const Calendar = ({ selectedDate, onDateChange, tasks = [], habits = [], onAchievement }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  // Update currentDate when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday = 1
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Monday = 1

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const isCurrentMonth = (date) => isSameMonth(date, currentDate);
  const isToday = (date) => isSameDay(date, new Date());
  const isSelected = (date) => selectedDate && isSameDay(date, selectedDate);
  
  // Handle date click with achievement check
  const handleDateClickWithAchievement = (date) => {
    const { isPerfectDay, overallCompletionRate, totalTasks, completedTasks, totalHabits, completedHabits } = getDayProductivity(date);
    
    // Trigger achievement animation if perfect day
    if (isPerfectDay && onAchievement) {
      onAchievement({
        type: 'perfect-day',
        date: format(date, 'dd MMMM yyyy', { locale: ru }),
        stats: {
          tasks: `${completedTasks}/${totalTasks}`,
          habits: `${completedHabits}/${totalHabits}`,
          completion: `${Math.round(overallCompletionRate)}%`
        }
      });
    }
    
    if (onDateChange) {
      onDateChange(date);
    }
  };

  // Calculate productivity for a specific day
  const getDayProductivity = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Get tasks for this day
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.datetime);
      return format(taskDate, 'yyyy-MM-dd') === dateStr;
    });
    
    // Get habits completed on this day
    const dayHabits = habits.filter(habit => {
      const completedDates = habit.completedDates || [];
      return completedDates.includes(dateStr);
    });
    
    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter(task => task.completed).length;
    const totalHabits = habits.length;
    const completedHabits = dayHabits.length;
    
    // Calculate task completion rate
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate habit completion rate
    const habitCompletionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
    
    // Calculate combined completion rate (both tasks and habits must be considered)
    let overallCompletionRate = 0;
    if (totalTasks > 0 && totalHabits > 0) {
      // Both tasks and habits exist - average their completion rates
      overallCompletionRate = (taskCompletionRate + habitCompletionRate) / 2;
    } else if (totalTasks > 0) {
      // Only tasks exist
      overallCompletionRate = taskCompletionRate;
    } else if (totalHabits > 0) {
      // Only habits exist
      overallCompletionRate = habitCompletionRate;
    }
    
    // Check for perfect day achievement
    const isPerfectDay = (
      totalTasks > 5 && 
      completedTasks === totalTasks && 
      totalHabits > 0 && 
      completedHabits === totalHabits
    );
    
    return {
      taskCompletionRate,
      habitCompletionRate,
      overallCompletionRate,
      totalTasks,
      completedTasks,
      totalHabits,
      completedHabits,
      isPerfectDay
    };
  };
  
  // Get color class based on productivity
  const getProductivityClass = (date) => {
    const { overallCompletionRate, totalTasks, totalHabits } = getDayProductivity(date);
    
    // Only show productivity colors if there are tasks or habits for the day
    if (totalTasks === 0 && totalHabits === 0) return '';
    
    // Green only when everything is 100% complete
    if (overallCompletionRate === 100) return 'productive-high';
    if (overallCompletionRate >= 50) return 'productive-medium';
    if (overallCompletionRate > 0) return 'productive-low';
    return '';
  };
  
  // Check if day has achievement star
  const hasAchievementStar = (date) => {
    const { isPerfectDay } = getDayProductivity(date);
    return isPerfectDay;
  };

  return (
    <div className="calendar">
      <div className="month">
        <button className="nav" onClick={prevMonth}>
          <i className="fas fa-angle-left"></i>
        </button>
        <div>
          {format(currentDate, 'MMMM', { locale: ru })} 
          <span className="year">{format(currentDate, 'yyyy')}</span>
        </div>
        <button className="nav" onClick={nextMonth}>
          <i className="fas fa-angle-right"></i>
        </button>
      </div>
      
      <div className="days">
        {weekDays.map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      
      <div className="dates">
        {days.map((day, index) => {
          const productivityClass = getProductivityClass(day);
          const hasStar = hasAchievementStar(day);
          
          return (
            <button
              key={index}
              className={`
                ${isToday(day) ? 'today' : ''} 
                ${isSelected(day) ? 'selected' : ''}
                ${!isCurrentMonth(day) ? 'other-month' : ''}
                ${productivityClass}
              `}
              onClick={() => handleDateClickWithAchievement(day)}
              disabled={!isCurrentMonth(day)}
            >
              <time>{format(day, 'd')}</time>
              {hasStar && <span className="achievement-star">⭐</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
