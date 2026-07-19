// Mock API & Real Backend Adapter for WayPoint
// Set USE_MOCK_API=true to force mock data, or false to use real backend with fallback

const USE_MOCK_API = false;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waypoint-backend.vercel.app/api/v1';

// Helper for fetch with JSON error handling
async function request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (!res.ok) {
    let errorMessage = `API Error: ${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = text.substring(0, 100);
        }
      }
    } catch {
      // ignore stream read error
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Auth & User
  async signup(email: string, phone: string, otp: string) {
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 500));
      return { token: 'mock_jwt', user: { id: 'user_123', role: 'student', theme: 'default' } };
    }
    return request<{ token?: string; user?: Record<string, unknown> }>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, phone, otp }) });
  },

  async getCurrentUser(token?: string) {
    if (USE_MOCK_API) {
      return { user: { id: 'user_123', role: 'student', theme: 'default', onboardingComplete: true, name: 'Student', email: 'student@example.com' } };
    }
    return request<{ user?: { id?: string; clerkId?: string; name?: string; email?: string; role?: string; theme?: string; onboardingComplete?: boolean } }>('/user/me', { method: 'GET' }, token);
  },

  async updateProfile(updates: Record<string, unknown>, token?: string) {
    if (USE_MOCK_API) {
      return { user: { id: 'user_123', ...updates } };
    }
    return request<{ user?: Record<string, unknown> }>('/user/me', { method: 'PATCH', body: JSON.stringify(updates) }, token);
  },

  async updateTheme(theme: string, token?: string) {
    if (USE_MOCK_API) return { theme };
    try {
      return await request<{ theme: string }>('/user/me/theme', { method: 'PATCH', body: JSON.stringify({ theme }) }, token);
    } catch (err) {
      console.warn('Backend updateTheme warning, falling back to local:', err);
      return { theme };
    }
  },

  async updateMood(mood: number, token?: string) {
    if (USE_MOCK_API) return { mood };
    try {
      return await request<{ mood: number }>('/user/me/mood', { method: 'PATCH', body: JSON.stringify({ mood }) }, token);
    } catch (err) {
      console.warn('Backend updateMood warning, falling back to local:', err);
      return { mood };
    }
  },

  async updateConsent(consents: { screening?: boolean; analytics?: boolean; counsellorSharing?: boolean }, token?: string) {
    if (USE_MOCK_API) return { consents };
    try {
      return await request<{ consents?: Record<string, boolean> }>('/user/me/consent', { method: 'POST', body: JSON.stringify(consents) }, token);
    } catch (err) {
      console.warn('Backend updateConsent warning, falling back:', err);
      return { consents };
    }
  },

  async completeOnboarding(token?: string) {
    if (USE_MOCK_API) return { onboardingComplete: true };
    try {
      return await request<{ onboardingComplete?: boolean }>('/user/me/complete-onboarding', { method: 'POST' }, token);
    } catch (err) {
      console.warn('Backend completeOnboarding warning, falling back:', err);
      return { onboardingComplete: true };
    }
  },

  async getUserStats(token?: string) {
    if (USE_MOCK_API) return { xp: 120, level: 2, streak: { current: 3, longest: 5 }, badges: [] };
    return request<{ xp?: number; level?: number; streak?: { current?: number; longest?: number }; badges?: Record<string, unknown>[] }>('/user/me/stats', { method: 'GET' }, token);
  },

  // Chat
  async sendChatMessage(message: string, theme: string, mood: number, token?: string) {
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 1000));
      return {
        reply: "I'm here to listen and support you. Take a deep breath. Would you like to try a grounding exercise or talk more?",
        actions: ["exercises", "resources", "quick_check"],
        sources: ["wellness_resources"]
      };
    }
    return request<{ reply?: string; actions?: string[]; sources?: string[] }>('/chat', { method: 'POST', body: JSON.stringify({ message, theme, mood }) }, token);
  },

  async getChatHistory(limit = 50, skip = 0, token?: string) {
    if (USE_MOCK_API) return { chats: [], total: 0 };
    return request<{ chats?: Record<string, unknown>[]; total?: number }>(`/chat/history?limit=${limit}&skip=${skip}`, { method: 'GET' }, token);
  },

  async deleteChatHistory(token?: string) {
    if (USE_MOCK_API) return { message: 'Chat history deleted', deletedCount: 0 };
    return request<{ message?: string; deletedCount?: number }>('/chat/history', { method: 'DELETE' }, token);
  },

  // Bookings
  async getAvailableCounsellors(specialization?: string, language?: string, token?: string) {
    if (USE_MOCK_API) {
      return {
        counsellors: [
          { clerkId: 'c1', name: 'Dr. Sarah Sharma', email: 'sarah@waypoint.org', counsellorProfile: { specializations: ['Anxiety', 'Academic Stress'], averageRating: 4.9, bio: 'Experienced campus counselor.' } },
          { clerkId: 'c2', name: 'Dr. Rajesh Patel', email: 'rajesh@waypoint.org', counsellorProfile: { specializations: ['Depression', 'Relationships'], averageRating: 4.8, bio: 'Student wellbeing specialist.' } }
        ]
      };
    }
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (language) params.append('language', language);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request<{ counsellors?: Array<{ clerkId: string; name: string; email: string; counsellorProfile?: { specializations?: string[]; averageRating?: number; bio?: string; verified?: boolean } }> }>(`/bookings/counsellors/available${queryStr}`, { method: 'GET' }, token);
  },

  async createBooking(bookingData: { counsellorId?: string; start: string; end: string; consentGiven: boolean; studentEmail: string; studentName?: string; reason?: string }, token?: string) {
    if (USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 800));
      return { booking_id: `booking_${Date.now()}`, status: 'confirmed', message: 'Booking confirmed successfully.' };
    }
    return request<{ booking_id?: string; id?: string; status?: string; message?: string }>('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }, token);
  },

  async requestMatch(studentId: string, locale: string, summary: string, token?: string) {
    if (USE_MOCK_API) {
      return { match_request_id: `match_${Date.now()}`, status: 'searching' };
    }
    return request<{ match_request_id?: string; status?: string; counsellor?: Record<string, unknown> }>('/bookings/match', { method: 'POST', body: JSON.stringify({ studentId, locale, summary }) }, token);
  },

  async getBookings(token?: string) {
    if (USE_MOCK_API) return { bookings: [] };
    return request<{ bookings?: Record<string, unknown>[] }>('/bookings', { method: 'GET' }, token);
  },

  // Resources
  async getResources(params: { category?: string; tag?: string; search?: string; page?: number } = {}, token?: string) {
    if (USE_MOCK_API) return { resources: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } };
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.tag) query.append('tags', params.tag);
    if (params.search) query.append('q', params.search);
    if (params.page) query.append('page', params.page.toString());
    return request<{ resources?: Array<{ id?: number | string; _id?: string; title: string; description: string; type: string; duration?: string; tags?: string[]; color?: string; url?: string }>; pagination?: Record<string, unknown> }>(`/resources?${query.toString()}`, { method: 'GET' }, token);
  },

  async getResourceById(id: string, token?: string) {
    return request<Record<string, unknown>>(`/resources/${id}`, { method: 'GET' }, token);
  },

  async completeResource(id: string, token?: string) {
    if (USE_MOCK_API) return { message: 'Resource completed', xpAwarded: 10 };
    return request<{ message?: string; xpAwarded?: number }>(`/resources/${id}/complete`, { method: 'POST' }, token);
  },

  // Forum
  async getPosts(category?: string, tags?: string, page = 1, token?: string) {
    if (USE_MOCK_API) return { posts: [], pagination: { total: 0, page: 1, limit: 20, pages: 1 } };
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (tags) params.append('tags', tags);
    params.append('page', page.toString());
    return request<{ posts?: Record<string, unknown>[]; pagination?: Record<string, unknown> }>(`/forum/posts?${params.toString()}`, { method: 'GET' }, token);
  },

  async getPostById(id: string, token?: string) {
    return request<Record<string, unknown>>(`/forum/posts/${id}`, { method: 'GET' }, token);
  },

  async createPost(postData: { title: string; content: string; category?: string; tags?: string[]; anonymous?: boolean }, token?: string) {
    return request<Record<string, unknown>>('/forum/posts', { method: 'POST', body: JSON.stringify(postData) }, token);
  },

  async addComment(postId: string, commentData: { content: string; anonymous?: boolean }, token?: string) {
    return request<Record<string, unknown>>(`/forum/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(commentData) }, token);
  },

  async togglePostLike(postId: string, token?: string) {
    return request<Record<string, unknown>>(`/forum/posts/${postId}/like`, { method: 'POST' }, token);
  },

  async toggleCommentLike(commentId: string, token?: string) {
    return request<Record<string, unknown>>(`/forum/comments/${commentId}/like`, { method: 'POST' }, token);
  },

  async flagPost(postId: string, reason: string, token?: string) {
    return request<Record<string, unknown>>(`/forum/posts/${postId}/flag`, { method: 'POST', body: JSON.stringify({ reason }) }, token);
  },

  // Admin
  async getAnalytics(from?: string, to?: string, token?: string) {
    if (USE_MOCK_API) {
      return {
        overview: { totalUsers: 1247, dau: 89, totalBookings: 34, weeklyScreenings: 45, escalationCount: 3, flaggedPosts: 2 },
        bookingsPerDay: [],
        avgChatSentiment: 0.72,
        chatTrend: { data: [] },
        moodDistribution: [{ _id: 1, count: 5 }, { _id: 3, count: 20 }, { _id: 5, count: 15 }],
        streaks: { avgCurrent: 4.2, avgLongest: 8.5 },
        topResources: []
      };
    }
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return request<{
      overview?: { totalUsers?: number; dau?: number; totalBookings?: number; weeklyScreenings?: number; escalationCount?: number; flaggedPosts?: number };
      avgChatSentiment?: number;
      streaks?: { avgCurrent?: number; avgLongest?: number };
      alerts?: Array<{ id?: string | number; severity?: string; message: string; timestamp?: string }>;
    }>(`/admin/analytics?${params.toString()}`, { method: 'GET' }, token);
  },

  async getAlerts(token?: string) {
    if (USE_MOCK_API) return { alerts: [] };
    return request<{ alerts?: Array<{ id?: string | number; severity?: string; message: string; timestamp?: string }> }>('/admin/alerts', { method: 'GET' }, token);
  },

  async getCounsellors(token?: string) {
    if (USE_MOCK_API) return { counsellors: [] };
    return request<{ counsellors?: Record<string, unknown>[] }>('/admin/counsellors', { method: 'GET' }, token);
  },

  async verifyCounsellor(counsellorId: string, verified: boolean, notes?: string, token?: string) {
    return request<Record<string, unknown>>(`/admin/counsellors/${counsellorId}/verify`, { method: 'PATCH', body: JSON.stringify({ verified, notes }) }, token);
  },

  async getFlaggedPosts(token?: string) {
    return request<{ posts?: Record<string, unknown>[] }>('/admin/flagged-posts', { method: 'GET' }, token);
  },

  async moderatePost(postId: string, action: 'approve' | 'remove' | 'lock', notes?: string, token?: string) {
    return request<Record<string, unknown>>(`/admin/posts/${postId}/moderate`, { method: 'PATCH', body: JSON.stringify({ action, notes }) }, token);
  },

  // Screening
  async getQuestions(type: 'PHQ-9' | 'GAD-7') {
    return request<{ type: string; title: string; description: string; questions: string[]; options: Array<{ value: number; label: string }> }>(`/screening/questions?type=${type}`, { method: 'GET' });
  },

  async submitScreening(type: string, responses: Array<{ question: string; score: number }>, token?: string) {
    return request<{ score?: number; totalScore?: number; maxScore?: number; severity?: string; interpretation?: string; recommendations?: string[]; suicidalIdeation?: boolean }>('/screening', { method: 'POST', body: JSON.stringify({ type, responses }) }, token);
  },

  async getScreeningHistory(token?: string) {
    return request<{ screenings?: Array<{ _id?: string; type: string; totalScore: number; severity: string; createdAt: string }> }>('/screening/history', { method: 'GET' }, token);
  },

  // Quick Check
  async startQuickCheck(token?: string) {
    return request<{ sessionId: string; question: string; questionNumber: number }>('/quick-check/start', { method: 'POST' }, token);
  },

  async answerQuickCheck(sessionId: string, answer: string, conversationHistory: Array<{ question: string; answer: string }>, token?: string) {
    return request<{
      completed: boolean;
      question?: string;
      questionNumber?: number;
      result?: {
        transcript: Array<{ question: string; answer: string }>;
        summary: string;
        risk_level: 'low' | 'moderate' | 'high';
        suggested_next_steps: string[];
        resources: string[];
        meta: {
          approx_questions_asked: number;
          readiness_score: number;
        };
      };
    }>('/quick-check/answer', { method: 'POST', body: JSON.stringify({ sessionId, answer, conversationHistory }) }, token);
  },

  async submitExerciseAttempt(exerciseId: string, startTs: string, endTs: string, duration: number, token?: string) {
    if (USE_MOCK_API) return { xp_awarded: 10, progress_key: 'wp_progress_beats' };
    return request<{ xp_awarded?: number; progress_key?: string }>('/exercise/attempt', { method: 'POST', body: JSON.stringify({ exercise_id: exerciseId, start_ts: startTs, end_ts: endTs, duration }) }, token);
  }
};

export const isUsingMockApi = () => USE_MOCK_API;