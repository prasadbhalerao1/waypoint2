/**
 * useAdmin Hook
 * Check if the current user has admin privileges
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

// List of admin emails - must match backend
const ADMIN_EMAILS = [
  'prasad9a38@gmail.com',
  'waypointplatform@gmail.com'
];

export function useAdmin() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      setIsChecking(true);
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setIsChecking(false);
      return;
    }

    // Get primary email address
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    );

    if (primaryEmail) {
      const userEmail = primaryEmail.emailAddress.toLowerCase();
      const adminStatus = ADMIN_EMAILS.includes(userEmail);
      setIsAdmin(adminStatus);
    } else {
      setIsAdmin(false);
    }

    setIsChecking(false);
  }, [user, isLoaded]);

  return { isAdmin, isChecking };
}
