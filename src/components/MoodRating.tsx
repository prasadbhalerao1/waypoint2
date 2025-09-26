import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import moodMapData from '../data/moodMap.json';

interface MoodRatingProps {
  onComplete: () => void;
  showTitle?: boolean;
  isUpdate?: boolean;
}

const MoodRating: React.FC<MoodRatingProps> = ({ onComplete, showTitle = true, isUpdate = false }) => {
  const { mood, setMood, currentTheme } = useTheme();
  const [selectedMood, setSelectedMood] = useState(mood);

  const moodLabels = ['Overwhelmed', 'Struggling', 'Okay', 'Good', 'Great'];
  const moodEmojis = ['😰', '😔', '😐', '😊', '😄'];

  const handleMoodSelect = (moodValue: number) => {
    setSelectedMood(moodValue);
    setMood(moodValue);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className={`${!isUpdate ? 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100' : ''} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {showTitle && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
            <p className="text-gray-600">This helps me guide you.</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleMoodSelect(value)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-wp-primary focus:ring-offset-2 ${
                selectedMood === value
                  ? 'border-2 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: selectedMood === value ? currentTheme.primary : undefined,
                backgroundColor: selectedMood === value ? currentTheme.primary + '10' : undefined
              }}
              aria-label={`Rate mood as ${value} - ${moodLabels[value - 1]}`}
              aria-pressed={selectedMood === value}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{moodEmojis[value - 1]}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{value} - {moodLabels[value - 1]}</div>
                  <div className="text-sm text-gray-500">
                    {value === 1 && "I'm really struggling right now"}
                    {value === 2 && "Things are pretty tough today"}
                    {value === 3 && "I'm doing okay, nothing special"}
                    {value === 4 && "I'm feeling pretty good today"}
                    {value === 5 && "I'm feeling amazing!"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleComplete}
          className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-wp-primary focus:ring-offset-2"
          style={{ backgroundColor: currentTheme.primary }}
          aria-label="Continue with selected mood"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MoodRating;