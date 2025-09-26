import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';
import MoodRating from '../components/MoodRating';
import { Shield, Database, Users, Check } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'consent' | 'theme' | 'mood'>('consent');
  const [consents, setConsents] = useState({
    screening: false,
    analytics: false,
    counselor: false
  });

  const handleConsentChange = (type: keyof typeof consents) => {
    setConsents(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleConsentComplete = () => {
    localStorage.setItem('waypoint-consents', JSON.stringify(consents));
    setStep('theme');
  };

  const handleThemeComplete = () => {
    setStep('mood');
  };

  const handleMoodComplete = () => {
    localStorage.setItem('waypoint-onboarded', 'true');
    navigate('/home', { replace: true });
  };

  if (step === 'theme') {
    return <ThemeSelector onComplete={handleThemeComplete} />;
  }

  if (step === 'mood') {
    return <MoodRating onComplete={handleMoodComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Privacy & Consent</h2>
          <p className="text-gray-600">
            Your privacy and wellbeing are our top priorities. Please review and choose your preferences.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  id="screening"
                  checked={consents.screening}
                  onChange={() => handleConsentChange('screening')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Screening Data Storage</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Allow WayPoint to securely store your mental health screening responses to track 
                  your progress over time and provide personalized recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={consents.analytics}
                  onChange={() => handleConsentChange('analytics')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Anonymized Analytics</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Help improve WayPoint by sharing anonymized usage data. This helps us understand 
                  how students use mental health resources and improve our services.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  id="counselor"
                  checked={consents.counselor}
                  onChange={() => handleConsentChange('counselor')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Share with Counselors</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Allow sharing of relevant context with counselors during sessions to provide 
                  more effective support. You can always revoke this permission later.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your data is always secure:</p>
              <ul className="space-y-1 text-xs">
                <li>• All data is encrypted and stored securely</li>
                <li>• You can delete your data at any time</li>
                <li>• We never share personal information with third parties</li>
                <li>• All counselor interactions are confidential</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleConsentComplete}
          className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
        >
          Continue to Theme Selection
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can change these preferences anytime in your account settings.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;