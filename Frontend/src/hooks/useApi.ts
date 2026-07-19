/**
 * useApi Hook
 * Automatically injects Clerk session token into API calls
 */

import { useAuth } from '@clerk/clerk-react';
import { api } from '../mockApi';

export function useApi() {
  const { getToken } = useAuth();

  const getValidToken = async (): Promise<string | undefined> => {
    try {
      const token = await getToken();
      return token ?? undefined;
    } catch {
      return undefined;
    }
  };

  return {
    getToken: getValidToken,

    // Auth & User
    getCurrentUser: async () => api.getCurrentUser(await getValidToken()),
    updateProfile: async (updates: Record<string, unknown>) => api.updateProfile(updates, await getValidToken()),
    updateTheme: async (theme: string) => api.updateTheme(theme, await getValidToken()),
    updateMood: async (mood: number) => api.updateMood(mood, await getValidToken()),
    updateConsent: async (consents: { screening?: boolean; analytics?: boolean; counsellorSharing?: boolean }) =>
      api.updateConsent(consents, await getValidToken()),
    completeOnboarding: async () => api.completeOnboarding(await getValidToken()),
    getUserStats: async () => api.getUserStats(await getValidToken()),

    // Chat
    sendChatMessage: async (message: string, theme: string, mood: number) =>
      api.sendChatMessage(message, theme, mood, await getValidToken()),
    getChatHistory: async (limit = 50, skip = 0) => api.getChatHistory(limit, skip, await getValidToken()),
    deleteChatHistory: async () => api.deleteChatHistory(await getValidToken()),

    // Bookings
    getAvailableCounsellors: async (specialization?: string, language?: string) =>
      api.getAvailableCounsellors(specialization, language, await getValidToken()),
    createBooking: async (bookingData: { counsellorId?: string; start: string; end: string; consentGiven: boolean; studentEmail: string; studentName?: string; reason?: string }) =>
      api.createBooking(bookingData, await getValidToken()),
    requestMatch: async (studentId: string, locale: string, summary: string) =>
      api.requestMatch(studentId, locale, summary, await getValidToken()),
    getBookings: async () => api.getBookings(await getValidToken()),

    // Resources
    getResources: async (params: { category?: string; tag?: string; search?: string; page?: number } = {}) =>
      api.getResources(params, await getValidToken()),
    getResourceById: async (id: string) => api.getResourceById(id, await getValidToken()),
    completeResource: async (id: string) => api.completeResource(id, await getValidToken()),

    // Forum
    getPosts: async (category?: string, tags?: string, page = 1) =>
      api.getPosts(category, tags, page, await getValidToken()),
    getPostById: async (id: string) => api.getPostById(id, await getValidToken()),
    createPost: async (postData: { title: string; content: string; category?: string; tags?: string[]; anonymous?: boolean }) =>
      api.createPost(postData, await getValidToken()),
    addComment: async (postId: string, commentData: { content: string; anonymous?: boolean }) =>
      api.addComment(postId, commentData, await getValidToken()),
    togglePostLike: async (postId: string) => api.togglePostLike(postId, await getValidToken()),
    toggleCommentLike: async (commentId: string) => api.toggleCommentLike(commentId, await getValidToken()),
    flagPost: async (postId: string, reason: string) => api.flagPost(postId, reason, await getValidToken()),

    // Admin
    getAnalytics: async (from?: string, to?: string) => api.getAnalytics(from, to, await getValidToken()),
    getAlerts: async () => api.getAlerts(await getValidToken()),
    getCounsellors: async () => api.getCounsellors(await getValidToken()),
    verifyCounsellor: async (counsellorId: string, verified: boolean, notes?: string) =>
      api.verifyCounsellor(counsellorId, verified, notes, await getValidToken()),
    getFlaggedPosts: async () => api.getFlaggedPosts(await getValidToken()),
    moderatePost: async (postId: string, action: 'approve' | 'remove' | 'lock', notes?: string) =>
      api.moderatePost(postId, action, notes, await getValidToken()),

    // Screening
    getQuestions: api.getQuestions,
    submitScreening: async (type: string, responses: Array<{ question: string; score: number }>) =>
      api.submitScreening(type, responses, await getValidToken()),
    getScreeningHistory: async () => api.getScreeningHistory(await getValidToken()),

    // Quick Check
    startQuickCheck: async () => api.startQuickCheck(await getValidToken()),
    answerQuickCheck: async (sessionId: string, answer: string, conversationHistory: Array<{ question: string; answer: string }>) =>
      api.answerQuickCheck(sessionId, answer, conversationHistory, await getValidToken()),

    // Exercise
    submitExerciseAttempt: async (exerciseId: string, startTs: string, endTs: string, duration: number) =>
      api.submitExerciseAttempt(exerciseId, startTs, endTs, duration, await getValidToken()),

    // Auth pass-through
    signup: api.signup
  };
}
