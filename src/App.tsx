import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Landing from './pages/Landing';
import Resources from './pages/Resources';
import Booking from './pages/Booking';
import Forum from './pages/Forum';
import Admin from './pages/Admin';
import MusicTherapy from './pages/MusicTherapy';

// Main App Content with Theme
const AppContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentTheme } = useTheme();
  
  // Check if user has completed onboarding
  const hasOnboarded = localStorage.getItem('waypoint-onboarded') === 'true';

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-500"
      style={{ 
        background: `linear-gradient(135deg, ${currentTheme.bg} 0%, ${currentTheme.surface} 100%)`
      }}
    >
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/*" element={
          hasOnboarded ? (
            <>
              <Navbar 
                isMobileMenuOpen={isMobileMenuOpen} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
              />
              <div className="flex">
                <Sidebar 
                  isMobileMenuOpen={isMobileMenuOpen} 
                  setIsMobileMenuOpen={setIsMobileMenuOpen} 
                />
                <main className="flex-1 lg:ml-64 pt-16">
                  <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Landing />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/music-therapy" element={<MusicTherapy />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </main>
              </div>
              <Footer />
            </>
          ) : (
            <Navigate to="/onboarding" replace />
          )
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;