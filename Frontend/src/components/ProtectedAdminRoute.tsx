/**
 * ProtectedAdminRoute Component
 * Restricts access to admin-only pages
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAdmin, isChecking } = useAdmin();

  // Show loading state while checking admin status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users to home page without interim UI to avoid flicker
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is admin, render the protected content
  return <>{children}</>;
};

export default ProtectedAdminRoute;
