import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../mockApi';
import { X, Phone, Star, Clock, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CounselorMatch {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  eta: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme } = useTheme();
  const [step, setStep] = useState<'consent' | 'searching' | 'matched' | 'calling'>('consent');
  const [counselor, setCounselor] = useState<CounselorMatch | null>(null);
  const [shareConsent, setShareConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleBookAppointment = async () => {
    if (!email || !name) {
      alert('Please enter your name and email.');
      return;
    }
    try {
      const payload = {
        studentEmail: email,
        studentName: name,
        counsellorId: counselor?.id || 'default_counselor',
        start: new Date(Date.now() + 5*60000).toISOString(), // Start in 5 minutes
        end: new Date(Date.now() + 35*60000).toISOString(),  // 30 min session
        consentGiven: shareConsent
      };
      
      const res = await fetch('http://localhost:4000/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('Booking successful! Check your email for confirmation.');
        onClose();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handleGetCounselor = async () => {
    if (!shareConsent || !email || !name) {
      alert('Please enter your name, email and give consent.');
      return;
    }
    
    setStep('searching');
    try {
      // Request a match (mocked or real depending on config)
      await api.requestMatch('s1', 'en', 'on-demand support');
      // For demo: immediately show a matched counselor
      const matched: CounselorMatch = {
        id: 'counselor_123',
        name: 'Dr. S***',
        specialty: 'Student Wellbeing & Anxiety Support',
        rating: 4.8,
        eta: '5 minutes'
      };
      setCounselor(matched);
      setStep('matched');
    } catch (error) {
      console.error('Failed to find counselor:', error);
      alert('Failed to find a counselor. Please try again.');
    }
  };

  const handleJoinCall = () => {
    setStep('calling');
    // Simulate call duration
    setTimeout(() => {
      onClose();
      setStep('consent');
      setCounselor(null);
      setShareConsent(false);
    }, 3000);
  };

  const handleCancel = () => {
    onClose();
    setStep('consent');
    setCounselor(null);
    setShareConsent(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Get Counselor Support</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'consent' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Support</h3>
                <p className="text-gray-600">
                  We'll connect you with an available counselor right now. This typically takes 3-6 minutes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="shareConsent"
                      checked={shareConsent}
                      onChange={(e) => setShareConsent(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="shareConsent" className="text-sm text-blue-800">
                      I consent to sharing minimal context from our conversation to help the counselor 
                      provide better support. This includes your current mood and any topics discussed today.
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGetCounselor}
                  disabled={!shareConsent}
                  className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 ${
                    shareConsent 
                      ? 'hover:scale-105 shadow-lg hover:shadow-xl' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: shareConsent ? currentTheme.primary : '#9CA3AF' }}
                >
                  Find Counselor Now
                </button>
                
                <button
                  onClick={handleCancel}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}

          {step === 'searching' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-full mx-auto animate-pulse"
                  style={{ backgroundColor: currentTheme.primary + '20' }}
                />
                <div 
                  className="absolute inset-4 rounded-full animate-ping"
                  style={{ backgroundColor: currentTheme.primary }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Finding your counselor...</h3>
                <p className="text-gray-600">
                  We're matching you with the best available counselor based on your needs.
                </p>
              </div>
            </div>
          )}

          {step === 'matched' && counselor && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Match Found!</h3>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-600">
                      {counselor.name.split(' ')[1]?.[0] || counselor.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{counselor.name}</h4>
                    <p className="text-sm text-gray-600">{counselor.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{counselor.rating.toFixed(1)}</span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-600">ETA: {counselor.eta}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBookAppointment}
                  className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <span>Book My Appointment</span>
                </button>

                <button
                  onClick={handleJoinCall}
                  className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Phone className="w-5 h-5" />
                  <span>Join Call</span>
                </button>
                
                <button
                  onClick={handleCancel}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'calling' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-full mx-auto animate-pulse"
                  style={{ backgroundColor: currentTheme.primary }}
                />
                <Phone className="absolute inset-0 w-8 h-8 text-white m-auto" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Connecting...</h3>
                <p className="text-gray-600">
                  You're being connected to {counselor?.name}. This is a demo - in the real app, 
                  you'd be in a secure video call.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;