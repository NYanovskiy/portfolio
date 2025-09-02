import React, { useRef, useState } from 'react';
import { save, STORAGE } from '../utils/storage';

const Settings = ({ isOpen, onClose, theme, onThemeChange, onFillSample, onReset }) => {
  const fileRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // Reset status
    setUploadStatus('');
    setIsUploading(true);
    
    // Check file size (limit to 5MB for better performance)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadStatus('Ошибка: файл слишком большой (максимум 5МБ)');
      setIsUploading(false);
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('Ошибка: поддерживаются только JPEG, PNG, WebP, GIF');
      setIsUploading(false);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result;
        
        // Validate the data URL
        if (!result || typeof result !== 'string' || !result.startsWith('data:image/')) {
          throw new Error('Invalid image data');
        }
        
        // Try to save the background
        save(STORAGE.BG, result);
        
        // Test if it was saved successfully
        const saved = localStorage.getItem(STORAGE.BG);
        if (!saved) {
          throw new Error('Failed to save to localStorage');
        }
        
        console.log('=== BACKGROUND UPLOAD DEBUG ===');
        console.log('Background saved successfully, length:', saved.length);
        console.log('Saved data starts with:', saved.substring(0, 30));
        console.log('Storage key used:', STORAGE.BG);
        
        // Test retrieval
        const testLoad = load(STORAGE.BG, null);
        console.log('Test load result:', {
          loaded: !!testLoad,
          length: testLoad ? testLoad.length : 0,
          matches: testLoad === saved
        });
        
        setUploadStatus('✅ Фон успешно загружен!');
        setIsUploading(false);
        
        // Immediately apply the background without waiting
        console.log('Applying background immediately');
        const root = document.documentElement;
        root.style.setProperty('--custom-bg', `url("${result}")`);
        
        // Also set directly on body
        document.body.style.backgroundImage = `url("${result}")`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        
        console.log('Background applied, checking CSS:');
        console.log('CSS var:', root.style.getPropertyValue('--custom-bg').substring(0, 50) + '...');
        console.log('Body style:', document.body.style.backgroundImage.substring(0, 50) + '...');
        
      } catch (error) {
        console.error('Background upload error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Ошибка: не удалось сохранить фон';
        if (error.message.includes('quota') || error.message.includes('QuotaExceededError')) {
          errorMessage = 'Ошибка: недостаточно места в хранилище. Попробуйте меньший файл.';
        } else if (error.message.includes('Invalid image')) {
          errorMessage = 'Ошибка: поврежденный файл изображения';
        }
        
        setUploadStatus(errorMessage);
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      setUploadStatus('Ошибка: не удалось прочитать файл');
      setIsUploading(false);
    };
    
    // Read file as data URL
    reader.readAsDataURL(file);
    
    // Clear the input
    e.target.value = '';
  };

  const handleUploadClick = () => {
    if (!isUploading && fileRef.current) {
      fileRef.current.click();
    }
  };

  const handleRemoveBackground = () => {
    try {
      localStorage.removeItem(STORAGE.BG);
      // Immediately remove background
      document.documentElement.style.setProperty('--custom-bg', 'none');
      document.body.style.backgroundImage = '';
      setUploadStatus('✅ Фон удален!');
      onThemeChange(theme);
      setTimeout(() => setUploadStatus(''), 2000);
    } catch (error) {
      setUploadStatus('Ошибка: не удалось удалить фон');
    }
  };

  const debugBackground = () => {
    console.log('=== BACKGROUND DEBUG ===');
    const bg = localStorage.getItem(STORAGE.BG);
    const loaded = load(STORAGE.BG, null);
    const cssVar = document.documentElement.style.getPropertyValue('--custom-bg');
    const bodyStyle = document.body.style.backgroundImage;
    
    console.log('LocalStorage raw:', {
      exists: !!bg,
      length: bg ? bg.length : 0,
      starts: bg ? bg.substring(0, 30) : 'none'
    });
    
    console.log('Load function result:', {
      exists: !!loaded,
      length: loaded ? loaded.length : 0,
      matches: loaded === bg
    });
    
    console.log('CSS status:', {
      cssVar: cssVar.substring(0, 50) + '...',
      bodyStyle: bodyStyle.substring(0, 50) + '...'
    });
    
    // Force reapply
    if (loaded) {
      const root = document.documentElement;
      root.style.setProperty('--custom-bg', `url("${loaded}")`);
      document.body.style.backgroundImage = `url("${loaded}")`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      console.log('Background reapplied');
    }
  };

  const themes = [
    { id: 'light', name: 'Светлая', description: 'Классическая светлая тема', color: '#ffffff', accent: '#ff9500' },
    { id: 'dark', name: 'Темная', description: 'Темная тема macOS', color: '#1c1c1e', accent: '#ff9500' },
    { id: 'glass', name: 'Стекло', description: 'Стеклянная прозрачность', color: '#2c2c2e', accent: '#ff9500' },
    { id: 'dark-glass', name: 'Темное стекло', description: 'Глубокий космос', color: '#000000', accent: '#ff9500' },
    { id: 'midnight', name: 'Полночь', description: 'MacBook Pro Midnight', color: '#121212', accent: '#ff9500' },
    { id: 'space-gray', name: 'Серый космос', description: 'MacBook Space Gray', color: '#2d2f33', accent: '#ff9500' },
    { id: 'graphite', name: 'Графит', description: 'Современный графит', color: '#2c2c2e', accent: '#ff9500' },
    { id: 'gold', name: 'Золотой', description: 'Золотой MacBook', color: '#7a6023', accent: '#ffd700' },
    { id: 'silver', name: 'Серебро', description: 'Серебряный MacBook', color: '#d0d0d0', accent: '#ff9500' },
    { id: 'purple', name: 'Галактика', description: 'Космический фиолетовый', color: '#330066', accent: '#8a2be2' },
    { id: 'pink', name: 'Закат', description: 'Теплый розовый', color: '#4a1a4a', accent: '#db7093' }
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card" style={{ border: 'none', boxShadow: 'none', padding: '24px', height: '100%', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>⚙️ Настройки</h3>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Color Theme Selection */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <div className="muted">🎨 Цветовая тема</div>
                <div style={{ fontWeight: 500, fontSize: '0.95rem', marginTop: 4 }}>
                  {currentTheme.name} - {currentTheme.description}
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                gap: 8,
                marginBottom: 16
              }}>
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => onThemeChange(themeOption.id)}
                    style={{
                      padding: '6px',
                      border: theme === themeOption.id ? `2px solid ${themeOption.accent}` : '1px solid var(--border)',
                      borderRadius: '12px',
                      background: 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      minHeight: '65px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--surface-hover)';
                      e.target.style.borderColor = themeOption.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--surface)';
                      e.target.style.borderColor = theme === themeOption.id ? themeOption.accent : 'var(--border)';
                    }}
                  >
                    {/* Theme Color Preview */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: themeOption.id === 'silver' ? 
                        `linear-gradient(135deg, ${themeOption.color} 0%, #e8e8e8 100%)` : 
                        `linear-gradient(135deg, ${themeOption.color} 0%, ${themeOption.accent} 100%)`,
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0
                    }} />
                    
                    {/* Theme Name */}
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      color: 'var(--text)',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      {themeOption.name}
                    </div>
                    
                    {/* Selected Indicator */}
                    {theme === themeOption.id && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: themeOption.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: '#fff'
                      }}>
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div className="muted">Демо</div>
                  <div style={{ fontWeight: 700 }}>Заполнить пример</div>
                </div>
                <button className="btn btn-primary" onClick={onFillSample} style={{ minWidth: '100px' }}>
                  Пример
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div className="muted">Данные</div>
                  <div style={{ fontWeight: 700 }}>Сброс</div>
                </div>
                <button
                  className="btn"
                  onClick={onReset}
                  style={{ color: 'crimson', minWidth: '100px' }}
                >
                  Сброс
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: 12 }}>
                  <div className="muted">🎇 Фон</div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Загрузить JPEG/PNG</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
                    Макс размер: 5МБ, форматы: JPEG, PNG, WebP, GIF
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-orange" 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  style={{ 
                    minWidth: '90px',
                    fontSize: '0.85rem',
                    flex: '1 1 auto'
                  }}
                >
                  {isUploading ? 'Загрузка...' : '📁 Загрузить'}
                </button>
                <button 
                  className="btn" 
                  onClick={handleRemoveBackground}
                  disabled={isUploading}
                  style={{ 
                    color: 'var(--red)',
                    minWidth: '80px',
                    fontSize: '0.85rem',
                    flex: '1 1 auto'
                  }}
                >
                  🗑️ Убрать
                </button>
                <button 
                  className="btn" 
                  onClick={debugBackground}
                  disabled={isUploading}
                  style={{ 
                    color: 'var(--accent)',
                    minWidth: '70px',
                    fontSize: '0.85rem',
                    flex: '1 1 auto'
                  }}
                >
                  🔍 Тест
                </button>
              </div>
              
              {/* Upload status */}
              {uploadStatus && (
                <div style={{ 
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  backgroundColor: uploadStatus.includes('Ошибка') 
                    ? 'rgba(255, 59, 48, 0.1)' 
                    : 'rgba(52, 199, 89, 0.1)',
                  color: uploadStatus.includes('Ошибка') 
                    ? 'var(--red)' 
                    : 'var(--green)',
                  border: `1px solid ${uploadStatus.includes('Ошибка') 
                    ? 'rgba(255, 59, 48, 0.2)' 
                    : 'rgba(52, 199, 89, 0.2)'}`
                }}>
                  {uploadStatus}
                </div>
              )}
              
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
