import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import { Send, Bot, User, Zap, BookOpen, Phone } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import BookingModal from '../components/BookingModal';
import MarkdownMessage from '../components/MarkdownMessage';
import moodMapData from '../data/moodMap.json';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  actions?: string[];
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme, mood } = useTheme();
  const api = useApi();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showTaskCard, setShowTaskCard] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll on new messages, not on initial load
    if (!isInitialLoad.current) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    loadInitialMessage();
  }, []);

  const loadInitialMessage = async () => {
    try {
      // Create initial message based on theme and mood
      const moodLabels = ['Overwhelmed', 'Struggling', 'Okay', 'Good', 'Great'];
      const moodLabel = moodLabels[mood - 1];
      
      let initialText = `Hi there! I'm your WayPoint assistant. I see you're feeling ${moodLabel.toLowerCase()} today. `;
      
      // Theme-specific greetings
      switch (currentTheme.id) {
        case 'home_ground':
          initialText += "Let's channel that athletic spirit and tackle whatever's on your mind! ";
          break;
        case 'studio':
          initialText += "Let's find your rhythm and get you back in harmony! ";
          break;
        case 'library':
          initialText += "Let's explore this chapter of your story together! ";
          break;
        default:
          initialText += "I'm here to support you on your wellness journey! ";
      }
      
      initialText += "How can I help you today?";
      
      const initialMessage: Message = {
        id: 'initial',
        text: initialText,
        isUser: false,
        timestamp: new Date(),
        actions: ['quick_check', 'exercises', 'resources']
      };
      
      setMessages([initialMessage]);
      isInitialLoad.current = false; // Mark initial load as complete
    } catch (error) {
      console.error('Failed to load initial message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageText = inputText;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      // Call real backend API with Clerk authentication
      const response = await api.sendChatMessage(messageText, currentTheme.id, mood);
      
      const moodData = moodMapData[mood.toString() as keyof typeof moodMapData];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false,
        timestamp: new Date(),
        actions: response.actions || moodData.suggestedActions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback to local response on error
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment, or if this is urgent, please reach out to a counselor directly.",
        isUser: false,
        timestamp: new Date(),
        actions: ['get_counselor', 'resources']
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  const handleQuickCheck = () => {
    const checkMessage: Message = {
      id: Date.now().toString(),
      text: "Let's do a quick mental health check. On a scale of 1-10, how would you rate your stress level today?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, checkMessage]);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'exercises':
        const exerciseMessage: Message = {
          id: Date.now().toString(),
          text: "Here are some exercises that might help. Choose one to begin:",
          isUser: false,
          timestamp: new Date(),
          actions: ['breathing', 'grounding', 'journaling', 'music']
        };
        setMessages(prev => [...prev, exerciseMessage]);
        break;
      case 'breathing':
      case 'grounding':
      case 'journaling':
      case 'music':
        setShowTaskCard(action);
        break;
      case 'get_counselor':
        setShowBookingModal(true);
        break;
      case 'quick_check':
        handleQuickCheck();
        break;
      case 'resources':
        navigate('/resources');
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const handleTaskComplete = () => {
    // Add a completion message
    const aiMessage: Message = {
      id: Date.now().toString(),
      text: currentTheme.completionMessages[showTaskCard as keyof typeof currentTheme.completionMessages],
      isUser: false,
      timestamp: new Date(),
      actions: ['exercises', 'resources', 'chat']
    };

    setMessages(prev => [...prev, aiMessage]);
    setShowTaskCard(null);
  };  const handleTaskBack = () => {
    setShowTaskCard(null);
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'breathing': 'Try Breathing',
      'grounding': 'Grounding Exercise',
      'journaling': 'Journal',
      'music': 'Music Therapy',
      'get_counselor': 'Get Counselor',
      'quick_check': 'Quick Check',
      'exercises': 'Try Exercise',
      'resources': 'Resources',
      'crisis_support': 'Crisis Support'
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'exercises':
      case 'breathing':
      case 'grounding':
      case 'journaling':
      case 'music':
        return Zap;
      case 'resources':
        return BookOpen;
      case 'get_counselor':
      case 'crisis_support':
        return Phone;
      default:
        return Zap;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: currentTheme.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">WayPoint Assistant</h1>
              <p className="text-sm text-gray-500">
                {currentTheme.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-10rem)]">
        {showTaskCard ? (
          <div className="mb-6">
            <TaskCard
              type={showTaskCard as any}
              onComplete={handleTaskComplete}
              onBack={handleTaskBack}
            />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="space-y-4 mb-4 flex-1 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md xl:max-w-lg`}>
                    {!message.isUser && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: currentTheme.primary + '20' }}
                      >
                        <Bot className="w-4 h-4" style={{ color: currentTheme.primary }} />
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.isUser
                          ? 'text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-sm'
                      }`}
                      style={{
                        backgroundColor: message.isUser ? currentTheme.primary : undefined
                      }}
                    >
                      {message.isUser ? (
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      ) : (
                        <MarkdownMessage content={message.text} className="text-sm leading-relaxed" />
                      )}
                      
                      {/* Action Buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action) => {
                            const IconComponent = getActionIcon(action);
                            return (
                              <button
                                key={action}
                                onClick={() => handleAction(action)}
                                className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full border transition-all duration-200 hover:scale-105"
                                style={{
                                  borderColor: currentTheme.primary,
                                  color: currentTheme.primary,
                                  backgroundColor: currentTheme.primary + '10'
                                }}
                              >
                                <IconComponent className="w-3 h-3" />
                                <span>{getActionLabel(action)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-2 ${message.isUser ? 'text-white opacity-75' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.isUser && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows={2}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': currentTheme.primary } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-3 text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </form>

            {/* Quick Actions Footer */}
            <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-xs">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTaskCard('breathing')}
                    className="flex-1 py-2 px-3 text-xs rounded-lg border transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      backgroundColor: currentTheme.primary + '10'
                    }}
                  >
                    <Zap className="w-3 h-3 mx-auto mb-1" />
                    Exercise
                  </button>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex-1 py-2 px-3 text-xs rounded-lg border transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: currentTheme.accent,
                      color: currentTheme.accent,
                      backgroundColor: currentTheme.accent + '10'
                    }}
                  >
                    <Phone className="w-3 h-3 mx-auto mb-1" />
                    Counselor
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
      />
    </div>
  );
};

export default Chat;