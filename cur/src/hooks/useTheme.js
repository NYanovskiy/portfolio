import { useEffect } from 'react';
import { load, STORAGE } from '../utils/storage';

export const useTheme = (theme) => {
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'glass', 'dark-glass', 'midnight', 'space-gray', 'graphite', 'gold', 'silver', 'purple', 'pink');
    
    // macOS 26 Future Theme System
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'glass') {
      root.classList.add('glass');
    } else if (theme === 'dark-glass') {
      root.classList.add('dark-glass');
    } else if (theme === 'midnight') {
      root.classList.add('midnight');
    } else if (theme === 'space-gray') {
      root.classList.add('space-gray');
    } else if (theme === 'graphite') {
      root.classList.add('graphite');
    } else if (theme === 'gold') {
      root.classList.add('gold');
    } else if (theme === 'silver') {
      root.classList.add('silver');
    } else if (theme === 'purple') {
      root.classList.add('purple');
    } else if (theme === 'pink') {
      root.classList.add('pink');
    }
    // Light theme is default and uses CSS variables from :root

    // Load custom background with enhanced error handling
    try {
      const customBg = load(STORAGE.BG, null);
      
      console.log('Theme changed, checking background:', {
        theme,
        backgroundFound: !!customBg,
        backgroundLength: customBg ? customBg.length : 0,
        backgroundStart: customBg ? customBg.substring(0, 30) + '...' : 'none'
      });
      
      if (customBg && customBg.trim() !== '') {
        console.log('Applying custom background:', customBg.substring(0, 50) + '...');
        
        // Set the CSS variable
        root.style.setProperty('--custom-bg', `url("${customBg}")`);
        
        // Also set it directly on body as a fallback
        document.body.style.backgroundImage = `url("${customBg}")`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        
        // Log what was actually set
        console.log('CSS variable set:', root.style.getPropertyValue('--custom-bg'));
        console.log('Body style set:', document.body.style.backgroundImage.substring(0, 50) + '...');
      } else {
        console.log('No custom background found, using default');
        root.style.setProperty('--custom-bg', 'none');
        document.body.style.backgroundImage = '';
      }
    } catch (error) {
      console.error('Error loading custom background:', error);
      root.style.setProperty('--custom-bg', 'none');
      document.body.style.backgroundImage = '';
    }
  }, [theme]);
};
