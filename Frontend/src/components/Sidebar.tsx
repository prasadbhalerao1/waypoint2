import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageCircle, BookOpen, Calendar, Users, Home, X, BarChart3, Music, ClipboardList } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAdmin } from '../hooks/useAdmin';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentTheme } = useTheme();
  const { isAdmin } = useAdmin();
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const allNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'AI Assistant' },
    { path: '/screening', icon: ClipboardList, label: 'Mental Health Screening' },
    { path: '/resources', icon: BookOpen, label: 'Resource Hub' },
    { path: '/music-therapy', icon: Music, label: 'Music Therapy' },
    { path: '/booking', icon: Calendar, label: 'Booking' },
    { path: '/forum', icon: Users, label: 'Peer Support' },
    { path: '/admin', icon: BarChart3, label: 'Admin Dashboard', adminOnly: true },
  ];

  // Filter nav items based on admin status
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 themed-text/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-full w-80 backdrop-blur-md border-r shadow-lg z-50
          lg:top-16 lg:w-64 lg:translate-x-0 lg:z-40
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ 
          backgroundColor: currentTheme.surface + 'F5',
          borderColor: currentTheme.primary + '20'
        }}
      >
        {/* Mobile Menu Header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTheme.primary + '20' }}
            >
              <span className="font-bold text-sm" style={{ color: currentTheme.primary }}>W</span>
            </div>
            <span className="text-xl font-bold text-gray-800">WayPoint</span>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
      <nav className="p-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`
                }
                style={({ isActive }: { isActive: boolean }) => isActive ? {
                  backgroundColor: currentTheme.primary + '20',
                  color: currentTheme.primary
                } : {}}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile User Profile / Sign In */}
        <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
          <SignedIn>
            <div className="flex items-center justify-center">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
                afterSignOutUrl="/sign-in"
              />
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button 
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Users className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;