import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Landing from './pages/Landing';
import Resources from './pages/Resources';
import Booking from './pages/Booking';
import ForumNew from './pages/ForumNew';
import Admin from './pages/Admin';
import MusicTherapy from './pages/MusicTherapy';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Screening from './pages/Screening';

// Main App Content with Theme
const AppContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(() => 
    localStorage.getItem('waypoint-onboarded') === 'true'
  );
  const { currentTheme } = useTheme();

  // Listen for changes to onboarding status
  React.useEffect(() => {
    const checkOnboardingStatus = () => {
      const status = localStorage.getItem('waypoint-onboarded') === 'true';
      setHasOnboarded(status);
    };

    // Check initially and add listener
    checkOnboardingStatus();
    window.addEventListener('storage', checkOnboardingStatus);

    // Custom event for internal state changes
    const onOnboardingComplete = () => checkOnboardingStatus();
    window.addEventListener('onboardingComplete', onOnboardingComplete);

    return () => {
      window.removeEventListener('storage', checkOnboardingStatus);
      window.removeEventListener('onboardingComplete', onOnboardingComplete);
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-500"
      style={{ 
        background: `linear-gradient(135deg, ${currentTheme.bg} 0%, ${currentTheme.surface} 100%)`
      }}
    >
      <Routes>
        {/* Public routes - Sign In/Up */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* Root route - redirect based on auth status */}
        <Route 
          path="/" 
          element={
            <>
              <SignedIn>
                {hasOnboarded ? (
                  <Navigate to="/home" replace /> 
                ) : (
                  <Navigate to="/onboarding" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            <SignedIn>
              {hasOnboarded ? (
                <Navigate to="/home" replace />
              ) : (
                <Onboarding />
              )}
            </SignedIn>
          } 
        />
        <Route 
          path="/home" 
          element={
            <SignedIn>
              {hasOnboarded ? (
                <>
                  <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                  <div className="flex">
                    <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <main className="flex-1 lg:ml-64 pt-16">
                      <Landing />
                    </main>
                  </div>
                </>
              ) : (
                <Navigate to="/onboarding" replace />
              )}
            </SignedIn>
          } 
        />
        <Route path="/*" element={
          <>
            <SignedIn>
              {hasOnboarded ? (
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
                        <Route path="/screening" element={<Screening />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/music-therapy" element={<MusicTherapy />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/forum" element={<ForumNew />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="*" element={<Navigate to="/home" replace />} />
                      </Routes>
                    </main>
                  </div>
                  <Footer />
                </>
              ) : (
                <Navigate to="/onboarding" replace />
              )}
            </SignedIn>
            <SignedOut>
              <Navigate to="/sign-in" replace />
            </SignedOut>
          </>
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