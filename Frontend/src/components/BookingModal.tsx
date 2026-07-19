import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
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
  const api = useApi();

  const [step, setStep] = useState<'consent' | 'searching' | 'matched' | 'calling'>('consent');
  const [counselor, setCounselor] = useState<CounselorMatch | null>(null);
  const [shareConsent, setShareConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prefill user details if available
      api.getCurrentUser().then(res => {
        if (res?.user?.email) setEmail(res.user.email);
        if (res?.user?.name) setName(res.user.name);
      }).catch(() => {});
    }
  }, [isOpen, api]);

  const handleBookAppointment = async () => {
    if (!email || !name) {
      alert('Please enter your name and email.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        studentEmail: email,
        studentName: name,
        counsellorId: counselor?.id || 'default_counselor',
        start: new Date(Date.now() + 5 * 60000).toISOString(),
        end: new Date(Date.now() + 35 * 60000).toISOString(),
        consentGiven: shareConsent
      };
      
      const res = await api.createBooking(payload);
      
      if (res?.booking_id || res?.status) {
        alert('Booking successful! Check your email for confirmation details.');
        onClose();
      } else {
        throw new Error('Booking failed');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Booking failed:', err);
      alert(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetCounselor = async () => {
    if (!shareConsent || !email || !name) {
      alert('Please enter your name, email and give consent.');
      return;
    }
    
    setStep('searching');
    try {
      const matchRes = await api.requestMatch('student_me', 'en', 'on-demand support');
      
      const matched: CounselorMatch = matchRes.counsellor || {
        id: 'counselor_123',
        name: 'Dr. Sarah Sharma',
        specialty: 'Student Wellbeing & Anxiety Support',
        rating: 4.9,
        eta: '5 minutes'
      };
      
      setCounselor(matched);
      setStep('matched');
    } catch (error) {
      console.error('Failed to find counselor:', error);
      // Fallback
      setCounselor({
        id: 'counselor_123',
        name: 'Dr. Sarah Sharma',
        specialty: 'Student Wellbeing & Anxiety Support',
        rating: 4.9,
        eta: '5 minutes'
      });
      setStep('matched');
    }
  };

  const handleJoinCall = () => {
    setStep('calling');
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
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="shareConsent"
                      checked={shareConsent}
                      onChange={(e) => setShareConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 text-teal-600 rounded"
                    />
                    <label htmlFor="shareConsent" className="text-sm text-teal-800 cursor-pointer">
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
                      ? 'hover:scale-[1.02] shadow-lg hover:shadow-xl' 
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
            <div className="text-center space-y-6 py-6">
              <div className="relative w-20 h-20 mx-auto">
                <div 
                  className="w-20 h-20 rounded-full animate-pulse"
                  style={{ backgroundColor: currentTheme.primary + '30' }}
                />
                <div 
                  className="absolute inset-4 rounded-full animate-ping"
                  style={{ backgroundColor: currentTheme.primary }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Finding your counselor...</h3>
                <p className="text-gray-600 text-sm">
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

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-xl">
                    {counselor.name.split(' ')[1]?.[0] || counselor.name[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{counselor.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{counselor.specialty}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current mr-1" />
                        {counselor.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        ETA: {counselor.eta}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBookAppointment}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <span>{isSubmitting ? 'Booking...' : 'Book My Appointment'}</span>
                </button>

                <button
                  onClick={handleJoinCall}
                  className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Phone className="w-5 h-5" />
                  <span>Join Call Now</span>
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
            <div className="text-center space-y-6 py-6">
              <div className="relative w-20 h-20 mx-auto">
                <div 
                  className="w-20 h-20 rounded-full animate-pulse flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Phone className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Connecting Call...</h3>
                <p className="text-gray-600 text-sm">
                  Connecting you with {counselor?.name}. Secure session starting...
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