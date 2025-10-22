import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I am WayPoint, your Mental Health Assistant. How can I guide you today? I'm here to help you with stress management, study techniques, emotional support, or connect you with professional resources.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simulate AI response for demo
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: "Thank you for sharing that with me. I understand this can be challenging. Here are some helpful strategies I'd recommend: 1) Practice deep breathing exercises, 2) Break tasks into smaller manageable steps, 3) Consider speaking with a campus counselor. Would you like me to help you book an appointment or provide more specific coping techniques?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="bg-white rounded-t-2xl shadow-lg flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">WayPoint AI Assistant</h2>
              <p className="opacity-90">Available 24/7 for mental health support</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md xl:max-w-lg`}>
                {!message.isUser && (
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-teal-600" />
                  </div>
                )}
                
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-teal-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-teal-100' : 'text-gray-500'}`}>
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

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This is a demo interface. Your conversations will be confidential in the live version.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;