import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Play, Pause, Square, Volume2, Music, Headphones } from 'lucide-react';

interface MusicResource {
  id: string;
  title: string;
  description: string;
  audioFile: string;
  duration: string;
  category: string;
  emoji: string;
}

const MusicTherapy: React.FC = () => {
  const { currentTheme, addProgress } = useTheme();
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const musicResources: MusicResource[] = [
    {
      id: 'calm-focus',
      title: 'Calm Focus',
      description: 'Enhance concentration and reduce anxiety with this gentle ambient track.',
      audioFile: 'calm_focus_loop.mp3',
      duration: '2:00',
      category: 'Focus',
      emoji: '🎧'
    },
    {
      id: 'meditation',
      title: 'Deep Meditation',
      description: 'A peaceful composition designed for meditation and mindfulness practice.',
      audioFile: 'meditation.mp3',
      duration: '5:00',
      category: 'Meditation',
      emoji: '🧘'
    },
    {
      id: 'stress-relief',
      title: 'Stress Relief',
      description: 'Natural sounds combined with gentle melodies to help reduce stress.',
      audioFile: 'stress_relief.mp3',
      duration: '3:00',
      category: 'Relaxation',
      emoji: '🌊'
    }
  ];

  const togglePlay = (resourceId: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying === resourceId) {
      audio.pause();
      setIsPlaying(null);
    } else {
      const resource = musicResources.find(r => r.id === resourceId);
      if (resource) {
        audio.src = `/assets/${resource.audioFile}`;
        audio.play()
          .then(() => {
            setIsPlaying(resourceId);
          })
          .catch(error => {
            console.error('Error playing audio:', error);
          });
      }
    }
  };

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(null);
  };

  const handleCompletion = () => {
    addProgress(10);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-wp-text">Music Therapy</h1>
            <p className="text-wp-muted">Discover healing through sound and rhythm</p>
          </div>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          onEnded={handleCompletion}
          className="hidden"
        />

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {musicResources.map(resource => (
            <div 
              key={resource.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{resource.emoji}</span>
                <div>
                  <h3 className="font-bold text-wp-text">{resource.title}</h3>
                  <p className="text-sm text-wp-muted">{resource.category} • {resource.duration}</p>
                </div>
              </div>

              <p className="text-wp-text mb-4">{resource.description}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePlay(resource.id)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300"
                  style={{ 
                    backgroundColor: isPlaying === resource.id ? currentTheme.primary : currentTheme.primary + '20',
                    color: isPlaying === resource.id ? 'white' : currentTheme.primary
                  }}
                >
                  {isPlaying === resource.id ? (
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

                {isPlaying === resource.id && (
                  <button
                    onClick={stopPlayback}
                    className="p-2 text-wp-muted hover:text-wp-text transition-colors duration-300"
                    aria-label="Stop playback"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Safety Tips */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Headphones className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Safety Tips for Music Therapy</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• Use headphones at a comfortable volume level</li>
                <li>• Take regular breaks between sessions</li>
                <li>• Find a quiet, comfortable space</li>
                <li>• Stop if you experience any discomfort</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div 
            className="fixed bottom-4 right-4 bg-wp-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce"
            style={{ backgroundColor: currentTheme.primary }}
          >
            Session complete! +10 points
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicTherapy;