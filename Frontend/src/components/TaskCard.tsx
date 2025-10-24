import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Play, Pause, ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';

interface TaskCardProps {
  type: 'breathing' | 'grounding' | 'journaling' | 'music';
  onComplete: () => void;
  onBack: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ type, onComplete, onBack }) => {
  const { currentTheme, addProgress } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [vibe, setVibe] = useState('calm');
  const [journalText, setJournalText] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    { name: 'Calm Focus (lo-fi)', file: '/calm_focus_loop.mp3' },
    { name: 'Ambient Sounds', file: '/calm_focus_loop.mp3' }
  ];

  const getTaskConfig = () => {
    switch (type) {
      case 'breathing':
        return {
          title: 'Take a mindful breath 🫁',
          steps: [
            'Find a comfortable position and close your eyes',
            'Breathe in slowly for 4 counts',
            'Hold your breath for 4 counts',
            'Exhale slowly for 6 counts'
          ]
        };
      case 'grounding':
        return {
          title: 'Ground yourself with 5-4-3-2-1 🌱',
          steps: [
            'Name 5 things you can see around you',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste'
          ]
        };
      case 'journaling':
        return {
          title: 'Express your thoughts ✍️',
          steps: [
            'Take a moment to center yourself',
            'Write about what\'s on your mind',
            'Reflect on your feelings'
          ]
        };
      case 'music':
        return {
          title: 'Take a 2-min music reset 🎶',
          steps: [
            'Choose your vibe and track',
            'Listen mindfully',
            'Let the music wash over you'
          ]
        };
      default:
        return { title: '', steps: [] };
    }
  };

  const config = getTaskConfig();

  const handleNext = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const points = type === 'journaling' ? 20 : type === 'grounding' ? 15 : 10;
    addProgress(points);
    onComplete();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    handleComplete();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleTrackEnd);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleTrackEnd);
        }
      };
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto border-l-4" 
         style={{ borderLeftColor: currentTheme.primary }}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{config.title}</h3>
        
        {/* Progress dots */}
        <div className="flex space-x-2 mb-4">
          {config.steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'scale-110' : 'scale-100'
              }`}
              style={{
                backgroundColor: index <= currentStep ? currentTheme.primary : '#E5E7EB'
              }}
            />
          ))}
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-6">
        {type === 'music' ? (
          <div className="space-y-4">
            {/* Vibe Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose your vibe:</label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="calm">Calm</option>
                <option value="focus">Focus</option>
                <option value="energize">Energize</option>
              </select>
            </div>

            {/* Track Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Track:</label>
              <select
                value={currentTrack}
                onChange={(e) => setCurrentTrack(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tracks.map((track, index) => (
                  <option key={index} value={index}>{track.name}</option>
                ))}
              </select>
            </div>

            {/* Music Player */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{tracks[currentTrack].name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <div className="flex space-x-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-full transition-all duration-300 ${
                            isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{
                            backgroundColor: isPlaying ? currentTheme.accent : '#D1D5DB',
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <audio
                ref={audioRef}
                src={tracks[currentTrack].file}
                onEnded={handleTrackEnd}
              />
            </div>
          </div>
        ) : type === 'journaling' && currentStep === 1 ? (
          <div>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What's on your mind today? Write freely..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {type === 'breathing' && '🫁'}
              {type === 'grounding' && '🌱'}
              {type === 'journaling' && '✍️'}
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {config.steps[currentStep]}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Chat</span>
        </button>
        
        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <span>{currentStep === config.steps.length - 1 ? 'Complete' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;