import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Play, Pause, Square, Volume2, Headphones } from 'lucide-react';

interface MusicTherapyCardProps {
  onProgressUpdate?: (points: number) => void;
}

const MusicTherapyCard: React.FC<MusicTherapyCardProps> = ({ onProgressUpdate }) => {
  const { currentTheme, addProgress } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('calm_focus_loop.mp3');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    { id: 'calm_focus_loop.mp3', name: 'Calm Focus', emoji: '🎧' },
    { id: 'relaxed_breathing_loop.mp3', name: 'Lo-fi Chill', emoji: '🎶' },
    { id: 'deep_breathing_loop.mp3', name: 'Deep Breathing', emoji: '🌊' }
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      addProgress(10);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      if (onProgressUpdate) {
        onProgressUpdate(10);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [addProgress, onProgressUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        console.log('Audio unavailable');
      });
      setIsPlaying(true);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
  };

  const handleTrackChange = (trackId: string) => {
    setCurrentTrack(trackId);
    stop();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-wp-surface rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <Volume2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-wp-text">Music Therapy — 2 min reset 🎧</h3>
          <p className="text-sm text-wp-muted">Find your rhythm and flow</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Track Selector */}
        <div>
          <label className="block text-sm font-medium text-wp-text mb-2">
            Choose your track:
          </label>
          <select
            value={currentTrack}
            onChange={(e) => handleTrackChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wp-primary focus:border-transparent"
            style={{ backgroundColor: currentTheme.surface }}
            aria-label="Select music track"
          >
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.emoji} {track.name}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={`/assets/${currentTrack}`}
          preload="metadata"
          onError={() => console.log('Audio unavailable')}
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-wp-muted">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: currentTheme.primary
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-wp-primary focus:ring-offset-2"
            style={{ backgroundColor: currentTheme.primary }}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={stop}
            className="w-10 h-10 rounded-full flex items-center justify-center text-wp-muted hover:text-wp-text transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary focus:ring-offset-2"
            aria-label="Stop music"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Tip */}
        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
          <Headphones className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            Tip: use headphones at low volume.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-wp-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          Nice beat! +10 Beats
        </div>
      )}
    </div>
  );
};

export default MusicTherapyCard;
