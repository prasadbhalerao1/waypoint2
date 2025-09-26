import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import themesData from '../data/themes.json';

export interface Theme {
  id: string;
  name: string;
  category: string;
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  gradientStart: string;
  gradientEnd: string;
  progressLabel: string;
  mascot: string;
  description: string;
  completionMessages: {
    breathing: string;
    grounding: string;
    journaling: string;
    music: string;
  };
}

interface ThemeContextType {
  currentTheme: Theme;
  mood: number;
  progress: number;
  setThemeById: (themeId: string) => void;
  setMood: (mood: number) => void;
  addProgress: (points: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themesData.default as Theme);
  const [mood, setMoodState] = useState<number>(3);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Load from localStorage with new keys
    const savedTheme = localStorage.getItem('wp_theme');
    const savedMood = localStorage.getItem('wp_mood');
    const savedProgress = localStorage.getItem('wp_progress_beats');

    if (savedTheme && themesData[savedTheme as keyof typeof themesData]) {
      setCurrentTheme(themesData[savedTheme as keyof typeof themesData] as Theme);
    }
    if (savedMood) {
      setMoodState(parseInt(savedMood));
    }
    if (savedProgress) {
      setProgress(parseInt(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Apply CSS variables for theme
    const root = document.documentElement;
    root.style.setProperty('--wp-primary', currentTheme.primary);
    root.style.setProperty('--wp-accent', currentTheme.accent);
    root.style.setProperty('--wp-bg', currentTheme.bg);
    root.style.setProperty('--wp-surface', currentTheme.surface);
    root.style.setProperty('--wp-text', currentTheme.text);
    root.style.setProperty('--wp-muted', currentTheme.muted);
    root.style.setProperty('--wp-gradient-start', currentTheme.gradientStart);
    root.style.setProperty('--wp-gradient-end', currentTheme.gradientEnd);
  }, [currentTheme]);

  const setThemeById = (themeId: string) => {
    const theme = themesData[themeId as keyof typeof themesData] as Theme;
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('wp_theme', themeId);
    }
  };

  const setMood = (newMood: number) => {
    setMoodState(newMood);
    localStorage.setItem('wp_mood', newMood.toString());
  };

  const addProgress = (points: number) => {
    const newProgress = progress + points;
    setProgress(newProgress);
    localStorage.setItem('wp_progress_beats', newProgress.toString());
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      mood,
      progress,
      setThemeById,
      setMood,
      addProgress
    }}>
      {children}
    </ThemeContext.Provider>
  );
};