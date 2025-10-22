import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, Heart, Phone } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../contexts/ThemeContext';

interface QuickCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConversationTurn {
  question: string;
  answer: string;
}

interface QuickCheckResult {
  transcript: ConversationTurn[];
  summary: string;
  risk_level: 'low' | 'moderate' | 'high';
  suggested_next_steps: string[];
  resources: string[];
  meta: {
    approx_questions_asked: number;
    readiness_score: number;
  };
}

const QuickCheckModal: React.FC<QuickCheckModalProps> = ({ isOpen, onClose }) => {
  const api = useApi();
  const { currentTheme } = useTheme();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      startQuickCheck();
    }
  }, [isOpen]);

  const startQuickCheck = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.startQuickCheck();
      setSessionId(response.sessionId);
      setCurrentQuestion(response.question);
      setQuestionNumber(response.questionNumber);
    } catch (err) {
      console.error('Failed to start Quick Check:', err);
      setError('Failed to start Quick Check. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !sessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      const newHistory = [...conversationHistory, { question: currentQuestion, answer: userAnswer }];
      setConversationHistory(newHistory);

      const response = await api.answerQuickCheck(sessionId, userAnswer, newHistory);

      if (response.completed) {
        setIsCompleted(true);
        setResult(response.result);
      } else {
        setCurrentQuestion(response.question);
        setQuestionNumber(response.questionNumber);
        setUserAnswer('');
      }
    } catch (err) {
      console.error('Failed to process answer:', err);
      setError('Failed to process your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSessionId(null);
    setCurrentQuestion('');
    setQuestionNumber(0);
    setUserAnswer('');
    setConversationHistory([]);
    setIsCompleted(false);
    setResult(null);
    setError(null);
    onClose();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-6 h-6" />;
      case 'moderate':
        return <AlertCircle className="w-6 h-6" />;
      case 'high':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Heart className="w-6 h-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div 
          className="p-6 border-b border-gray-200"
          style={{ backgroundColor: currentTheme.primary + '10' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Quick Mental Health Check</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isCompleted ? 'Check Complete' : `Question ${questionNumber} of ~10`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!isCompleted ? (
            <>
              {/* Conversation History */}
              {conversationHistory.length > 0 && (
                <div className="mb-6 space-y-4">
                  {conversationHistory.slice(-3).map((turn, index) => (
                    <div key={index} className="space-y-2">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">{turn.question}</p>
                      </div>
                      <div 
                        className="p-3 rounded-lg ml-4"
                        style={{ backgroundColor: currentTheme.primary + '20' }}
                      >
                        <p className="text-sm text-gray-800">{turn.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Question */}
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: currentTheme.primary }}>
                  <p className="text-lg font-medium text-gray-800">{currentQuestion}</p>
                </div>
              </div>

              {/* Answer Input */}
              <div className="space-y-3">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                  rows={4}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !userAnswer.trim()}
                  className="w-full py-3 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : result ? (
            <>
              {/* Results */}
              <div className="space-y-6">
                {/* Risk Level */}
                <div className={`p-4 rounded-lg border ${getRiskColor(result.risk_level)}`}>
                  <div className="flex items-center space-x-3">
                    {getRiskIcon(result.risk_level)}
                    <div>
                      <h3 className="font-semibold text-lg capitalize">Risk Level: {result.risk_level}</h3>
                      <p className="text-sm mt-1">{result.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">Suggested Next Steps</h3>
                  <ul className="space-y-2">
                    {result.suggested_next_steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">Available Resources</h3>
                  <div className="space-y-2">
                    {result.resources.map((resource, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Readiness Score */}
                {result.meta.readiness_score !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Readiness to take action:</strong> {result.meta.readiness_score}/10
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {isCompleted && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="w-full py-3 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickCheckModal;
