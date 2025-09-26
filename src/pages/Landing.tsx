import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import MusicTherapyCard from '../components/MusicTherapyCard';
import { Heart, Shield, Users, Brain, ArrowRight, Star } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme, mood, progress } = useTheme();

  const features = [
    {
      icon: Brain,
      title: 'AI-Guided Support',
      description: 'Get instant mental health guidance and coping strategies through our intelligent chatbot.',
    },
    {
      icon: Shield,
      title: 'Confidential & Safe',
      description: 'Your privacy is our priority. All conversations and data are completely confidential.',
    },
    {
      icon: Users,
      title: 'Peer Community',
      description: 'Connect with fellow students in a supportive, moderated environment.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-8 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-teal-100 rounded-full text-teal-800 text-sm font-medium mb-6">
            <Heart className="w-4 h-4 mr-2" />
            Smart India Hackathon 2024
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Way<span className="text-teal-600">Point</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-teal-700 font-medium mb-4">
            Your Campus Mental Health Companion
          </p>
          
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            WayPoint bridges the gap in college mental health support with AI-guided assistance, 
            confidential counseling booking, peer support forums, and comprehensive wellness resources 
            - all designed specifically for Indian college students.
          </p>

          {/* Progress Indicator */}
          {progress > 0 && (
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md">
                <span className="text-sm font-medium text-wp-text">
                  {currentTheme.progressLabel}: {progress}
                </span>
              </div>
            </div>
          )}

          {/* Mood + Assistant Message (responsive row) */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Mood Card */}
              <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-4 min-w-[220px] md:min-w-[260px]">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentTheme.primary + '20' }}
                  >
                    <span className="text-2xl">
                      {mood === 1 ? '😰' : mood === 2 ? '😔' : mood === 3 ? '😐' : mood === 4 ? '😊' : '😄'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-wp-text">Your Mood Today</h3>
                    <p className="text-wp-muted text-sm">
                      {mood === 1 ? 'Overwhelmed' : mood === 2 ? 'Struggling' : mood === 3 ? 'Okay' : mood === 4 ? 'Good' : 'Great'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/onboarding')}
                  aria-label="Update mood"
                  className="ml-auto text-xs text-wp-primary hover:text-wp-accent transition-colors duration-200"
                >
                  Update
                </button>
              </div>
              {/* Assistant Message */}
              <div className="bg-white rounded-xl shadow p-4 flex-1">
                <p className="text-wp-text">
                {mood <= 2 
                  ? `I notice you're feeling ${mood === 1 ? 'overwhelmed' : 'struggling'} today. Let's work together to find some calm. Would you like to try a breathing exercise or book a session with a counselor?`
                  : mood === 3
                  ? "You're doing okay today. How can I support you? Feel free to explore our resources or chat with me about anything on your mind."
                  : `Great to see you're feeling ${mood === 4 ? 'good' : 'amazing'} today! Let's keep this positive energy going. What would you like to explore?`
                }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/chat')}
              className="flex items-center px-8 py-4 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-medium hover:scale-105"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Start Chat Support
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button 
              onClick={() => navigate('/resources')}
              className="flex items-center px-8 py-4 bg-white rounded-xl transition-all duration-300 text-lg font-medium border-2 hover:scale-105"
              style={{ 
                color: currentTheme.primary,
                borderColor: currentTheme.primary,
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentTheme.primary + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Explore Resources
            </button>
          </div>
        </div>
      </section>

      {/* Music Therapy Section for Studio Theme */}
      {currentTheme.id === 'studio' && (
        <section className="px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <MusicTherapyCard />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="px-8 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose WayPoint?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-700 italic mb-6 leading-relaxed">
              "Mental health support shouldn't be a luxury. Every college student deserves access to 
              confidential, culturally-aware, and stigma-free psychological intervention tools."
            </blockquote>
            <cite className="text-teal-600 font-medium">- Department of Student Welfare</cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students already using WayPoint for their mental health support.
          </p>
          <button 
            onClick={() => navigate('/chat')}
            className="px-8 py-4 bg-white text-teal-600 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-medium"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;