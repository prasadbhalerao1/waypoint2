import React from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelectorButton from './ThemeSelectorButton';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentTheme } = useTheme();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className="fixed top-0 right-0 left-0 z-50 backdrop-blur-md border-b transition-all duration-300"
      style={{ 
        backgroundColor: currentTheme.surface + 'E6',
        borderColor: currentTheme.primary + '20'
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3 lg:ml-64">
          <Heart className="w-8 h-8" style={{ color: currentTheme.primary }} />
          <span className="text-2xl font-bold text-wp-text">WayPoint</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeSelectorButton />
          
          {/* Clerk Authentication */}
          <SignedIn>
            <div className="hidden sm:block">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
                afterSignOutUrl="/sign-in"
              />
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button 
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <span>Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>
          
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:themed-surface transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-6 h-6">
              <Menu 
                className={`absolute inset-0 w-6 h-6 text-gray-700 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                }`} 
              />
              <X 
                className={`absolute inset-0 w-6 h-6 text-gray-700 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                }`} 
              />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;