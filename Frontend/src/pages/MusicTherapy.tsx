import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Music, Headphones } from 'lucide-react';
import MusicTherapyCard from '../components/MusicTherapyCard';
import musicData from '../data/musicTherapy.json';

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

  // Use music resources from JSON data
  const musicResources: MusicResource[] = musicData.musicResources;

  const togglePlay = (resourceId: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying === resourceId) {
      audio.pause();
      setIsPlaying(null);
    } else {
      const resource = musicResources.find(r => r.id === resourceId);
      if (resource) {
        // Use the audio file from the resource data
        audio.src = `/${resource.audioFile}`;
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
            <MusicTherapyCard
              key={resource.id}
              id={resource.id}
              title={resource.title}
              description={resource.description}
              duration={resource.duration}
              category={resource.category}
              emoji={resource.emoji}
              isPlaying={isPlaying === resource.id}
              onTogglePlay={togglePlay}
              onStop={stopPlayback}
              currentTheme={currentTheme}
            />
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