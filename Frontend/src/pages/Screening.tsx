import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import { ClipboardList, TrendingUp, AlertCircle, CheckCircle, Phone } from 'lucide-react';

interface ScreeningQuestion {
  question: string;
  score: number;
}

interface ScreeningData {
  type: string;
  title: string;
  description: string;
  questions: string[];
  options: { value: number; label: string }[];
}

const Screening: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waypoint-demo-two-backend.vercel.app/api/v1';
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const api = useApi();
  
  const [selectedType, setSelectedType] = useState<'PHQ-9' | 'GAD-7' | null>(null);
  const [screeningData, setScreeningData] = useState<ScreeningData | null>(null);
  const [responses, setResponses] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (selectedType) {
      loadScreening(selectedType);
    }
  }, [selectedType]);

  const loadScreening = async (type: 'PHQ-9' | 'GAD-7') => {
    try {
      const response = await fetch(`${API_BASE_URL}/screening/questions?type=${type}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setScreeningData(data);
      setResponses(new Array(data.questions.length).fill(-1));
      setCurrentQuestion(0);
      setResult(null);
    } catch (error) {
      console.error('Failed to load screening:', error);
    }
  };

  const handleResponse = (score: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = score;
    setResponses(newResponses);

    if (currentQuestion < (screeningData?.questions.length || 0) - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (responses.some(r => r === -1)) {
      alert('Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedResponses = responses.map((score, index) => ({
        question: screeningData!.questions[index],
        score
      }));

      const token = await (api as any).getToken?.() ?? undefined;
      const response = await fetch(`${API_BASE_URL}/screening`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          type: selectedType,
          responses: formattedResponses
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to submit screening:', error);
      alert('Failed to submit screening. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistory = async () => {
    try {
      const token = await (api as any).getToken?.() ?? undefined;
      const response = await fetch(`${API_BASE_URL}/screening/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      const data = await response.json();
      setHistory(data.screenings || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'text-green-600 bg-green-100';
      case 'mild': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'moderately_severe': return 'text-red-600 bg-red-100';
      case 'severe': return 'text-red-700 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowHistory(false)}
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back to Screening
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Screening History</h1>
          
          <div className="space-y-4">
            {history.map((screening) => (
              <div key={screening._id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{screening.type}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(screening.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                      {screening.totalScore}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(screening.severity)}`}>
                      {screening.severity.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {result.suicidalIdeation ? (
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Immediate Support Needed</h2>
              </div>
            ) : (
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.primary }} />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete</h2>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Your Score:</span>
                <span className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
                  {result.totalScore}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Severity:</span>
                <span className={`px-4 py-2 rounded-full font-medium ${getSeverityColor(result.severity)}`}>
                  {result.severity ? result.severity.replace('_', ' ') : 'Unknown'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">What This Means:</h3>
              <p className="text-gray-700 leading-relaxed">{result.interpretation}</p>
            </div>

            {result.suicidalIdeation && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <Phone className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Crisis Helplines - Available 24/7</h3>
                    <div className="space-y-1 text-sm text-red-700">
                      <p>🆘 <strong>KIRAN:</strong> 1800-599-0019 (Toll-free)</p>
                      <p>📞 <strong>Vandrevala Foundation:</strong> 9999 666 555</p>
                      <p>📞 <strong>iCall (TISS):</strong> 9152987821</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/chat')}
                className="w-full py-3 text-white rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: currentTheme.primary }}
              >
                Talk to AI Assistant
              </button>
              
              {result.severity !== 'minimal' && (
                <button
                  onClick={() => navigate('/booking')}
                  className="w-full py-3 border-2 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ 
                    borderColor: currentTheme.primary,
                    color: currentTheme.primary
                  }}
                >
                  Book Counselor Session
                </button>
              )}
              
              <button
                onClick={() => {
                  setSelectedType(null);
                  setResult(null);
                }}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Take Another Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screeningData) {
    const progress = ((currentQuestion + 1) / screeningData.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">{screeningData.title}</h2>
              <span className="text-sm text-gray-600">
                {currentQuestion + 1} / {screeningData.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: currentTheme.primary }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 text-sm mb-6">{screeningData.description}</p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-6">
              {screeningData.questions[currentQuestion]}
            </h3>

            <div className="space-y-3">
              {screeningData.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    responses[currentQuestion] === option.value
                      ? 'border-current shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: responses[currentQuestion] === option.value ? currentTheme.primary : undefined,
                    backgroundColor: responses[currentQuestion] === option.value ? currentTheme.primary + '10' : undefined
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestion === screeningData.questions.length - 1 && responses.every(r => r !== -1) && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2 text-white rounded-lg font-medium"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <ClipboardList className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.primary }} />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mental Health Screening</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take a confidential assessment to understand your mental health better. 
            These scientifically validated tools can help identify symptoms and guide you to appropriate support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedType('PHQ-9')}
            className="bg-white rounded-2xl p-8 shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">PHQ-9</h2>
              <TrendingUp className="w-8 h-8" style={{ color: currentTheme.primary }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Depression Screening</h3>
            <p className="text-gray-600 mb-4">
              9 questions to assess depression symptoms over the past 2 weeks.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-6">
              <li>• Takes 2-3 minutes</li>
              <li>• Scientifically validated</li>
              <li>• Immediate results</li>
            </ul>
            <button
              className="w-full py-3 text-white rounded-xl font-medium transition-all"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Start PHQ-9
            </button>
          </div>

          <div
            onClick={() => setSelectedType('GAD-7')}
            className="bg-white rounded-2xl p-8 shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">GAD-7</h2>
              <AlertCircle className="w-8 h-8" style={{ color: currentTheme.accent }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Anxiety Screening</h3>
            <p className="text-gray-600 mb-4">
              7 questions to measure anxiety symptoms over the past 2 weeks.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-6">
              <li>• Takes 2 minutes</li>
              <li>• Clinically proven</li>
              <li>• Personalized recommendations</li>
            </ul>
            <button
              className="w-full py-3 text-white rounded-xl font-medium transition-all"
              style={{ backgroundColor: currentTheme.accent }}
            >
              Start GAD-7
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={loadHistory}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow hover:shadow-lg transition-all"
          >
            View Screening History
          </button>
        </div>

        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Privacy & Confidentiality</h3>
          <p className="text-sm text-blue-800">
            Your responses are encrypted and stored securely. Results are only visible to you and 
            (with your consent) counselors you choose to share with. These screenings are for 
            informational purposes and do not replace professional diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Screening;
