/**
 * useApi Hook
 * Automatically injects Clerk session token into API calls
 */

import { useAuth } from '@clerk/clerk-react';
import { api } from '../mockApi';

export function useApi() {
  const { getToken } = useAuth();

  return {
    // Chat
    sendChatMessage: async (message: string, theme: string, mood: number) => {
      const token = await getToken();
      return api.sendChatMessage(message, theme, mood, token ?? undefined);
    },

    // Theme & Mood
    updateTheme: async (theme: string) => {
      const token = await getToken();
      return api.updateTheme(theme, token ?? undefined);
    },

    updateMood: async (mood: number) => {
      const token = await getToken();
      return api.updateMood(mood, token ?? undefined);
    },

    // Exercise
    submitExerciseAttempt: async (exerciseId: string, startTs: string, endTs: string, duration: number) => {
      const token = await getToken();
      return api.submitExerciseAttempt(exerciseId, startTs, endTs, duration, token ?? undefined);
    },

    // Bookings
    createBooking: async (counsellorId: string, slot: string, shareContext: boolean) => {
      const token = await getToken();
      return api.createBooking(counsellorId, slot, shareContext, token ?? undefined);
    },

    requestMatch: async (studentId: string, locale: string, summary: string) => {
      const token = await getToken();
      return api.requestMatch(studentId, locale, summary, token ?? undefined);
    },

    // Admin
    getAnalytics: async (from: string, to: string) => {
      const token = await getToken();
      return api.getAnalytics(from, to, token ?? undefined);
    },

    // Non-authenticated endpoints (pass through)
    signup: api.signup,
  };
}
