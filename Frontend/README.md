# WayPoint Frontend Client

A polished React 18 (Vite) + TailwindCSS + TypeScript frontend for **WayPoint** that provides AI-guided mental health support, runtime theme personalization, music therapy, screening assessments, and counsellor booking features for college students.

Demo Site: [`https://waypoint-demo-two.vercel.app`](https://waypoint-demo-two.vercel.app)

---

## 🎨 Features

- 🎨 **Runtime Theme Personalization** - 4 custom themes (WayPoint Classic, Home Ground, Studio, Library) with dynamic CSS variables
- 🎵 **Music Therapy & Ambient Soundscapes** - Studio theme with audio controls and grounding exercises
- 🧠 **Mood-Based Support** - Dynamic AI assistant responses and action suggestions tailored to user mood rating (1-5 scale)
- 💾 **State Persistence** - `localStorage` for theme, mood, onboarding consent, and gamification XP points
- 🔌 **Backend Integration & Resilient Fallback** - Native `fetch` client connected to backend with automatic local fallback mode
- ♿ **Accessibility & Responsive Design** - ARIA attributes, keyboard navigation, and mobile-first responsive layouts

---

## 🌐 HTTP Request & Authentication Architecture

- **HTTP Client**: Uses standard browser-native **`fetch` API** in `mockApi.ts` and exposed via custom `useApi` hook.
- **Header Structure**:
  ```http
  Authorization: Bearer <clerk_session_token>
  Content-Type: application/json
  ```
- **CORS Handling**: `credentials: 'include'` enabled for secure origin request validation.
- **Fallback Engine**: Automated fallback to structured local data if API calls fail or `USE_MOCK_API = true`.

---

## 🎯 Endpoint Hooks & Services (`useApi.ts`)

- **User**: `getCurrentUser()`, `updateProfile()`, `updateTheme()`, `updateMood()`, `updateConsent()`, `completeOnboarding()`, `getUserStats()`
- **Chat**: `sendChatMessage()`, `getChatHistory()`, `deleteChatHistory()`
- **Bookings**: `getAvailableCounsellors()`, `createBooking()`, `requestMatch()`, `getBookings()`
- **Resources**: `getResources()`, `getResourceById()`, `completeResource()`
- **Forum**: `getPosts()`, `getPostById()`, `createPost()`, `addComment()`, `togglePostLike()`, `toggleCommentLike()`, `flagPost()`
- **Admin**: `getAnalytics()`, `getAlerts()`, `getCounsellors()`, `verifyCounsellor()`, `getFlaggedPosts()`, `moderatePost()`
- **Screening**: `getQuestions()`, `submitScreening()`, `getScreeningHistory()`
- **Quick Check**: `startQuickCheck()`, `answerQuickCheck()`

---

## 🚀 Quick Start & Scripts

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Commands

```bash
# Install dependencies
npm install

# Start development server (Port 5173)
npm run dev

# Run ESLint check (0 errors, 0 warnings)
npm run lint

# Compile TypeScript & build for production
npm run build

# Preview production build locally
npm run preview
```

---

## ⚙️ Configuration & Modes

### Mock Mode vs Real Backend Mode

In `src/mockApi.ts`:

**Mock Mode (Offline / Standalone):**
```typescript
const USE_MOCK_API = true;
```

**Real Backend Mode:**
```typescript
const USE_MOCK_API = false;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waypoint-backend.vercel.app/api/v1';
```

Set environment variable in `.env`:
```bash
VITE_API_BASE_URL=https://your-api.com/api/v1
```

---

## 💾 LocalStorage Keys

- `wp_theme` - Current theme ID (`default`, `home_ground`, `studio`, `library`)
- `wp_mood` - User mood (1-5 scale)
- `wp_progress_beats` - Progress points for gamification XP
- `wp_consents` - Privacy consent preferences
- `waypoint-onboarded` - Onboarding completion status

---

## 🎨 Themes Structure

Available Themes:
1. **Default (WayPoint Classic)** - Green palette (`#10B981`)
2. **Home Ground** - Sports theme with teal/orange
3. **Studio** - Music theme with purple/pink + Music Therapy
4. **Library** - Reading theme with dark green/gold

```json
{
  "id": "default",
  "name": "WayPoint Classic",
  "primary": "#10B981",
  "accent": "#34D399",
  "bg": "#F0FFF6",
  "progressLabel": "XP"
}
```

---

## 👤 User Flow

1. **Privacy & Consent** → Choose data sharing preferences
2. **Onboarding** → Set initial mood, choose UI theme, and complete profile setup
3. **Daily Check-in & AI Chat** → Interact with CBT assistant or run Quick Check assessment
4. **Mental Screening** → Take PHQ-9 / GAD-7 assessments with instant severity breakdown
5. **Counsellor Booking** → Match with verified counsellors and book confidential slots
6. **Peer Forum** → Share experiences anonymously or publicly with peer support
