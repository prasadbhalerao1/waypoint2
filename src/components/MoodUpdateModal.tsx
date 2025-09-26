import React from 'react';
import MoodRating from './MoodRating';

interface MoodUpdateModalProps {
  onClose: () => void;
}

const MoodUpdateModal: React.FC<MoodUpdateModalProps> = ({ onClose }) => {
  const handleMoodUpdate = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <MoodRating onComplete={handleMoodUpdate} isUpdate={true} />
      </div>
    </div>
  );
};

export default MoodUpdateModal;