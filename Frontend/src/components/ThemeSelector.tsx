import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import themesData from '../data/themes.json';
import { Palette, Dumbbell, Music, BookOpen, Compass } from 'lucide-react';

interface ThemeSelectorProps {
  onComplete: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onComplete }) => {
  const { setThemeById } = useTheme();

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'home_ground': return Dumbbell;
      case 'studio': return Music;
      case 'library': return BookOpen;
      default: return Compass;
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setThemeById(themeId);
    onComplete();
  };

  const handleSkip = () => {
    setThemeById('default');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Palette className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Vibe</h2>
          <p className="text-gray-600">Select a theme that resonates with you, or skip to use WayPoint Classic</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {Object.entries(themesData).map(([key, theme]) => {
            const IconComponent = getThemeIcon(key);
            return (
              <button
                key={key}
                onClick={() => handleThemeSelect(key)}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left group focus:outline-none focus:ring-2 focus:ring-wp-primary focus:ring-offset-2"
                style={{
                  '--theme-primary': theme.primary,
                  '--theme-accent': theme.accent
                } as React.CSSProperties}
                aria-label={`Select ${theme.name} theme`}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{theme.name}</h3>
                    <p className="text-sm text-gray-500">{theme.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Progress:</span>
                  <span 
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: theme.accent + '20',
                      color: theme.primary 
                    }}
                  >
                    {theme.progressLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 underline focus:outline-none focus:ring-2 focus:ring-wp-primary focus:ring-offset-2 rounded"
            aria-label="Skip theme selection and use WayPoint Classic"
          >
            Skip — Use WayPoint Classic
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;