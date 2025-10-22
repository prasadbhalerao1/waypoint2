import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import themesData from '../data/themes.json';
import { Palette, Dumbbell, Music, BookOpen, Compass } from 'lucide-react';

const ThemeSelectorButton: React.FC = () => {
  const { currentTheme, setThemeById } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'home_ground': return Dumbbell;
      case 'studio': return Music;
      case 'library': return BookOpen;
      default: return Compass;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + J to toggle theme menu
      if ((event.ctrlKey || event.metaKey) && event.key === 'j') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }

      // When menu is open, numbers 1-5 select themes
      if (isOpen && !event.ctrlKey && !event.metaKey) {
        const themeKeys = Object.keys(themesData);
        const index = parseInt(event.key) - 1;
        if (index >= 0 && index < themeKeys.length) {
          setThemeById(themeKeys[index]);
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, setThemeById]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg themed-button-outline flex items-center gap-2"
        aria-label="Change theme"
        aria-expanded={isOpen}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border themed-border overflow-hidden z-50">
          <div className="p-3 themed-gradient">
            <h3 className="text-white font-medium">Select Theme</h3>
          </div>
          <div className="p-2">
            {Object.entries(themesData).map(([key, theme]) => {
              const IconComponent = getThemeIcon(key);
              const isActive = currentTheme.id === key;
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    setThemeById(key);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-lg flex items-center gap-3 transition-all duration-200 relative group ${
                    isActive ? 'themed-surface' : ''
                  }`}
                  onMouseEnter={() => {
                    // Preview the theme
                    const root = document.documentElement;
                    root.style.setProperty('--wp-preview-primary', theme.primary);
                    root.style.setProperty('--wp-preview-accent', theme.accent);
                    root.classList.add('theme-preview');
                  }}
                  onMouseLeave={() => {
                    document.documentElement.classList.remove('theme-preview');
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium themed-text">{theme.name}</div>
                    <div className="text-xs themed-muted">{theme.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelectorButton;