import React from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface MusicTherapyCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  emoji: string;
  isPlaying: boolean;
  onTogglePlay: (id: string) => void;
  onStop: () => void;
  currentTheme: {
    primary: string;
  };
}

const MusicTherapyCard: React.FC<MusicTherapyCardProps> = ({
  id,
  title,
  description,
  duration,
  category,
  emoji,
  isPlaying,
  onTogglePlay,
  onStop,
  currentTheme
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="font-bold text-wp-text">{title}</h3>
          <p className="text-sm text-wp-muted">{category} • {duration}</p>
        </div>
      </div>

      <p className="text-wp-text mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onTogglePlay(id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300"
          style={{ 
            backgroundColor: isPlaying ? currentTheme.primary : currentTheme.primary + '20',
            color: isPlaying ? 'white' : currentTheme.primary
          }}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Play</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            onClick={onStop}
            className="p-2 text-wp-muted hover:text-wp-text transition-colors duration-300"
            aria-label="Stop playback"
          >
            <Square className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MusicTherapyCard;