import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../mockApi';
import { Send, Bot, User, Zap, BookOpen, Phone } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import BookingModal from '../components/BookingModal';
import moodMapData from '../data/moodMap.json';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  actions?: string[];
}

const Chat: React.FC = () => {
  const { currentTheme, mood, progress } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showTaskCard, setShowTaskCard] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    } catch (error) {
      console.error('Failed to load initial message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const moodData = moodMapData[mood.toString() as keyof typeof moodMapData];
      
      let response = "I understand what you're going through. ";
      
      // Check for crisis indicators
      if (inputText.toLowerCase().includes('harm myself') || inputText.toLowerCase().includes('suicide')) {
        response = "I'm really concerned about you right now. Your safety is the most important thing. Please reach out for immediate help - you can call the National Suicide Prevention Lifeline at 9152987821 or contact emergency services at 100. You don't have to go through this alone.";
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
          actions: ['crisis_support', 'get_counselor']
        };
        
        setMessages(prev => [...prev, aiMessage]);
        return;
      }

      // Theme-specific responses
      switch (currentTheme.id) {
        case 'homeGround':
          response += "Let's tackle this challenge like a champion athlete. ";
          break;
        case 'studio':
          response += "Let's find your rhythm and get back in harmony. ";
          break;
        case 'library':
          response += "Let's explore this chapter of your story together. ";
          break;
        default:
          response += "Let's work through this step by step. ";
      }

      if (inputText.toLowerCase().includes('anxious') || inputText.toLowerCase().includes('stress')) {
        response += "Here are some ways I can help you manage these feelings:";
      } else if (inputText.toLowerCase().includes('sad') || inputText.toLowerCase().includes('depressed')) {
        response += "I hear that you're struggling. Here are some supportive options:";
      } else {
        response += "How would you like to move forward?";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        actions: moodData.suggestedActions
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'breathing':
        setShowTaskCard('breathing');
        break;
      case 'grounding':
        setShowTaskCard('grounding');
        break;
      case 'journaling':
        setShowTaskCard('journaling');
        break;
      case 'music':
        setShowTaskCard('music');
        break;
      case 'get_counselor':
        setShowBookingModal(true);
        break;
      case 'quick_check':
        handleQuickCheck();
        break;
      default:
        console.log('Action not implemented:', action);
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

  const handleTaskComplete = () => {
    const completionMessage = currentTheme.completionMessages[showTaskCard as keyof typeof currentTheme.completionMessages];
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      text: completionMessage + " Great job completing that exercise! How are you feeling now?",
      isUser: false,
      timestamp: new Date(),
      actions: ['chat', 'exercises', 'resources']
    };

    setMessages(prev => [...prev, aiMessage]);
    setShowTaskCard(null);
  };

  const handleTaskBack = () => {
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
                {currentTheme.name} • {progress} {currentTheme.progressLabel}
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
            <div ref={messagesContainerRef} className="space-y-4 mb-4 flex-1 overflow-y-auto">
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
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      
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
                  className="px-6 py-3 text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
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