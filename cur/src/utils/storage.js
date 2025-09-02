// Storage keys
export const STORAGE = {
  TASKS: 'productivity_tracker_tasks',
  HABITS: 'productivity_tracker_habits',
  POMODOROS: 'productivity_tracker_pomodoros',
  THEME: 'productivity_tracker_theme',
  BG: 'productivity_tracker_bg'
};

// Load data from localStorage
export const load = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    // Handle background images differently (they're stored as raw data URLs)
    if (key === STORAGE.BG) {
      return item || defaultValue;
    }
    
    // Parse JSON for other data
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Save data to localStorage
export const save = (key, value) => {
  try {
    // Handle background images differently (store as raw data URL)
    if (key === STORAGE.BG) {
      if (value && value.trim() !== '') {
        // Validate data URL format
        if (!value.startsWith('data:image/')) {
          throw new Error('Invalid image data format');
        }
        
        // Check approximate size (Base64 encoding adds ~33% overhead)
        const approximateSize = value.length * 0.75;
        const maxSize = 8 * 1024 * 1024; // 8MB as a safety limit for localStorage
        
        if (approximateSize > maxSize) {
          throw new Error('Image too large for storage');
        }
        
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
      return;
    }
    
    // JSON stringify for other data
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    
    // If it's a quota exceeded error, try to provide helpful feedback
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      throw new Error('Storage quota exceeded. Try uploading a smaller image.');
    }
    
    if (error.message.includes('Invalid image') || error.message.includes('too large')) {
      throw error;
    }
    
    throw error;
  }
};

// Clear all app data
export const clearAll = () => {
  Object.values(STORAGE).forEach(key => {
    localStorage.removeItem(key);
  });
};
