// Mock API for WayPoint - mirrors backend contract
// Set USE_MOCK_API=true to use this, false to use real backend

const USE_MOCK_API = false; // Change to false when backend is available
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waypoint-backend.vercel.app/api/v1';

// Types
interface User {
  id: string;
  role: string;
  theme: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ChatResponse {
  reply: string;
  actions: string[];
  sources: string[];
}

interface BookingResponse {
  booking_id: string;
  status: string;
}

interface MatchResponse {
  match_request_id: string;
  status: string;
}

interface ExerciseResponse {
  xp_awarded: number;
  progress_key: string;
}

interface AnalyticsResponse {
  dau: number;
  screenings: number;
  flagged_percent: number;
  phq_avg: number;
}

// Mock data
const mockUser: User = {
  id: 'user_123',
  role: 'student',
  theme: 'default'
};

const mockToken = 'mock_jwt_token_123';

// API functions
export const api = {
  // Auth endpoints
  async signup(email: string, phone: string, otp: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        token: mockToken,
        user: mockUser
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, phone, otp })
    });
    return response.json();
  },

  // Theme & Mood endpoints
  async updateTheme(theme: string, token?: string): Promise<{ theme: string }> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { theme };
    }
    
    const response = await fetch(`${API_BASE_URL}/user/me/theme`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ theme })
    });
    return response.json();
  },

  async updateMood(mood: number, token?: string): Promise<{ mood: number }> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { mood };
    }
    
    const response = await fetch(`${API_BASE_URL}/user/me/mood`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ mood })
    });
    return response.json();
  },

  // Chat endpoint
  async sendChatMessage(message: string, theme: string, mood: number, token?: string): Promise<ChatResponse> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock responses based on mood
      const responses = {
        low: {
          reply: "I understand you're going through a tough time. Let's work together to find some calm. Would you like to try a breathing exercise or book a session with a counselor?",
          actions: ["playExercise", "bookCounsellor"],
          sources: ["breathing_exercises", "counsellor_booking"]
        },
        medium: {
          reply: "You're doing okay today. How can I support you? Feel free to explore our resources or chat with me about anything on your mind.",
          actions: ["exploreResources"],
          sources: ["wellness_resources"]
        },
        high: {
          reply: "Great to see you're feeling positive today! Let's keep this energy going. What would you like to explore?",
          actions: ["exploreResources", "shareProgress"],
          sources: ["wellness_resources", "community_forum"]
        }
      };

      const moodCategory = mood <= 2 ? 'low' : mood === 3 ? 'medium' : 'high';
      return responses[moodCategory];
    }
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ message, theme, mood })
    });

    // Handle non-JSON responses (e.g., Vercel error pages)
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
      } else {
        const text = await response.text();
        throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
      }
    }

    return response.json();
  },

  // Exercise endpoint
  async submitExerciseAttempt(exerciseId: string, startTs: string, endTs: string, duration: number, token?: string): Promise<ExerciseResponse> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        xp_awarded: 10,
        progress_key: "wp_progress_beats"
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/exercise/attempt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ exercise_id: exerciseId, start_ts: startTs, end_ts: endTs, duration })
    });
    return response.json();
  },

  // Booking endpoints
  async createBooking(counsellorId: string, slot: string, shareContext: boolean, token?: string): Promise<BookingResponse> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        booking_id: `booking_${Date.now()}`,
        status: "confirmed"
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ counsellor_id: counsellorId, slot, share_context: shareContext })
    });
    return response.json();
  },

  async requestMatch(studentId: string, locale: string, summary: string, token?: string): Promise<MatchResponse> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        match_request_id: `match_${Date.now()}`,
        status: "searching"
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/bookings/match`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ student_id: studentId, locale, summary })
    });
    return response.json();
  },

  // Admin analytics endpoint
  async getAnalytics(from: string, to: string, token?: string): Promise<AnalyticsResponse> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        dau: 123,
        screenings: 45,
        flagged_percent: 12,
        phq_avg: 6.2
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/analytics?from=${from}&to=${to}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include'
    });
    return response.json();
  },

  // Quick Check endpoints
  async startQuickCheck(token?: string): Promise<{ sessionId: string; question: string; questionNumber: number }> {
    const response = await fetch(`${API_BASE_URL}/quick-check/start`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include'
    });
    return response.json();
  },

  async answerQuickCheck(sessionId: string, answer: string, conversationHistory: any[], token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/quick-check/answer`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, answer, conversationHistory })
    });
    return response.json();
  }
};

// WebSocket simulation for real-time updates
export class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};

  connect() {
    // Simulate connection
    setTimeout(() => {
      this.emit('connected', {});
    }, 100);
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    // Disconnect simulation
  }

  // Simulate match status updates
  simulateMatchUpdate() {
    setTimeout(() => {
      this.emit('match_status', { status: 'matched', counsellor: { id: 'c1', nameMasked: 'Dr. S***', eta: '5 minutes' } });
    }, 3000);
  }
}

export const mockWebSocket = new MockWebSocket();

// Utility function to check if we should use mock API
export const isUsingMockApi = () => USE_MOCK_API;

// Configuration helper
export const getApiConfig = () => ({
  useMockApi: USE_MOCK_API,
  baseUrl: API_BASE_URL,
  token: localStorage.getItem('wp_token')
});