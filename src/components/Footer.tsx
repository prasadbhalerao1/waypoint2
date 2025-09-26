import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Heart, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <footer 
      className="mt-auto"
      style={{ 
        backgroundColor: currentTheme.primary + '10',
        borderTop: `1px solid ${currentTheme.primary + '20'}`
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <Heart 
                className="w-8 h-8" 
                style={{ color: currentTheme.primary }}
              />
              <span className="text-2xl font-bold text-wp-text">WayPoint</span>
            </div>
            <p className="text-wp-muted leading-relaxed text-sm sm:text-base">
              Your trusted campus mental health companion, providing 24/7 support 
              and resources for college students across India.
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: currentTheme.primary }}
            >
              Emergency Support
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: currentTheme.primary }}
                />
                <div>
                  <p className="font-medium text-wp-text text-sm">National Suicide Prevention</p>
                  <p className="text-wp-muted text-sm">9152987821</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: currentTheme.primary }}
                />
                <div>
                  <p className="font-medium text-wp-text text-sm">Campus Emergency</p>
                  <p className="text-wp-muted text-sm">100</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: currentTheme.primary }}
                />
                <div>
                  <p className="font-medium text-wp-text text-sm">Crisis Support Email</p>
                  <p className="text-wp-muted text-sm">help@waypoint.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: currentTheme.primary }}
            >
              Quick Access
            </h3>
            <div className="space-y-2">
              <a 
                href="/chat" 
                className="block text-wp-muted hover:text-wp-primary transition-colors duration-200 text-sm"
                aria-label="AI Mental Health Support"
              >
                AI Mental Health Support
              </a>
              <a 
                href="/booking" 
                className="block text-wp-muted hover:text-wp-primary transition-colors duration-200 text-sm"
                aria-label="Book Counseling Session"
              >
                Book Counseling Session
              </a>
              <a 
                href="/resources" 
                className="block text-wp-muted hover:text-wp-primary transition-colors duration-200 text-sm"
                aria-label="Wellness Resources"
              >
                Wellness Resources
              </a>
              <a 
                href="/forum" 
                className="block text-wp-muted hover:text-wp-primary transition-colors duration-200 text-sm"
                aria-label="Peer Support Community"
              >
                Peer Support Community
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
          style={{ borderColor: currentTheme.primary + '20' }}
        >
          <div className="text-center sm:text-left">
            <p className="text-wp-muted text-sm">
              © 2025 WayPoint Mental Health Platform. All rights reserved.
            </p>
            <p className="text-xs text-wp-muted mt-1">
              Smart India Hackathon 2025 • Computer Science and Business system
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-wp-muted">
            <span>Made with</span>
            <Heart 
              className="w-4 h-4 text-red-400 fill-current" 
              aria-hidden="true"
            />
            <span>by</span>
            <span 
              className="font-medium"
              style={{ color: currentTheme.primary }}
            >
              Prasad
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div 
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: currentTheme.primary + '05' }}
        >
          <p className="text-xs text-wp-muted text-center leading-relaxed">
            <strong className="text-wp-text">Important:</strong> WayPoint provides supportive resources and should not replace professional medical advice. 
            If you're experiencing a mental health emergency, please contact emergency services immediately or visit your nearest hospital.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;