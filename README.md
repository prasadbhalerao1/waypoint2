# WayPoint - Campus Mental Health Companion

> **Smart India Hackathon 2025** | AI-powered mental health support platform for Indian college students

WayPoint bridges the gap in college mental health support with AI-guided assistance, confidential counseling booking, peer support forums, and comprehensive wellness resources - all designed specifically for Indian college students.

Demo Site: [`https://waypoint-demo-two.vercel.app`](https://waypoint-demo-two.vercel.app)

---

## 🎯 Core Features

### For Students
- **🤖 AI Mental Health Assistant** - RAG-powered chat delivering culturally-aware CBT techniques, coping strategies, and crisis guidance
- **📋 Mental Health Screening** - PHQ-9 (depression) and GAD-7 (anxiety) assessments with immediate, explanatory results
- **🎵 Music Therapy** - Theme-matched ambient soundscapes for relaxation, focus, and stress relief
- **📚 Resource Hub** - Curated mental health resources (articles, videos, guides) in multiple regional languages
- **📅 Counselor Booking** - Confidential booking system to connect with verified mental health professionals
- **👥 Peer Support Forum** - Moderated community for students to share experiences and support each other
- **🎮 Gamification** - Streaks, XP, levels, and achievements to encourage consistent wellness practices
- **🎨 Theme Personalization** - Choose from multiple themes (Sports, Music, Reading, Calm) that customize the UI and experience

### For Counselors
- **📆 Availability Management** - Set and manage appointment slots
- **🔒 Secure Sessions** - Encrypted notes and confidential student information
- **📊 Performance Dashboard** - Track sessions, feedback, and engagement metrics

### For Administrators
- **📊 Analytics Dashboard** - Anonymized insights into student engagement, screening trends, and platform usage
- **🚨 Proactive Alerts** - Automated trend detection for early intervention
- **👥 Counselor Management** - Verify and manage mental health professionals on the platform

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Authentication**: Clerk (`@clerk/clerk-react`)
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Native browser `fetch` API wrapped with Clerk JWT tokens

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk JWT validation (`@clerk/express`)
- **AI Integration**: OpenAI API / Google Gemini
- **Security**: Helmet, CORS, Rate Limiting

---

## 🌐 HTTP Communication Strategy & Endpoint Mapping

- **HTTP Request Layer**: Uses standard native **`fetch` API** across all frontend services and hooks (`useApi.ts` & `mockApi.ts`).
- **Authentication**: Integrates with **Clerk Auth**, automatically injecting session JWT tokens via HTTP headers:
  ```http
  Authorization: Bearer <clerk_jwt_token>
  Content-Type: application/json
  ```
  with `credentials: 'include'` for CORS policy compliance.
- **Resilient Fallback Mode**: If backend services or database connections are unavailable, the frontend gracefully falls back to structured local mock data without breaking user flows.

### Endpoint Mapping Table

Every backend module in `server/src/routes/` is fully backed by corresponding frontend hooks (`useApi.ts`), API adapters (`mockApi.ts`), and interactive UI pages:

| Backend Domain | Express Routes (`/api/v1`) | Frontend Page / Component | Key Functionality |
| :--- | :--- | :--- | :--- |
| **User & Profile** | `/user/me`<br>`/user/me/theme`<br>`/user/me/mood`<br>`/user/me/consent`<br>`/user/me/complete-onboarding`<br>`/user/me/stats` | `Onboarding.tsx`<br>`ThemeSelector.tsx`<br>`MoodRating.tsx`<br>`Navbar.tsx` | Profile management, privacy consent tracking, runtime CSS theme selection, mood logs, and gamification XP stats. |
| **AI Assistant Chat** | `/chat`<br>`/chat/history` | `Chat.tsx`<br>`MarkdownMessage.tsx`<br>`TaskCard.tsx` | RAG-assisted CBT chat guidance, crisis keyword escalation, PII redaction, exercise triggers, and history management. |
| **Counsellor Bookings** | `/bookings`<br>`/bookings/counsellors/available`<br>`/bookings/match`<br>`/bookings/:id` | `Booking.tsx`<br>`BookingModal.tsx` | Counsellor discovery, instant AI matching, appointment scheduling, encrypted session notes, and email confirmation. |
| **Wellness Resources** | `/resources`<br>`/resources/:id`<br>`/resources/:id/complete` | `Resources.tsx`<br>`ResourceCard.tsx` | Categorized mental health guides, search & tag filtering, external resource launching, and completion XP rewards. |
| **Peer Support Forum** | `/forum/posts`<br>`/forum/posts/:id`<br>`/forum/posts/:id/comments`<br>`/forum/posts/:id/like`<br>`/forum/comments/:id/like`<br>`/forum/posts/:id/flag` | `ForumNew.tsx` | Anonymous & public peer discussion threads, nested comment trees, post/comment liking, and community flagging. |
| **Admin & Moderation** | `/admin/analytics`<br>`/admin/alerts`<br>`/admin/counsellors`<br>`/admin/counsellors/:id/verify`<br>`/admin/flagged-posts`<br>`/admin/posts/:id/moderate` | `Admin.tsx`<br>`ProtectedAdminRoute.tsx` | Anonymized DAU & mood analytics, early-warning system alerts, counsellor credential verification, and post moderation. |
| **Mental Screening** | `/screening/questions`<br>`/screening`<br>`/screening/history` | `Screening.tsx` | Standardized PHQ-9 (depression) & GAD-7 (anxiety) assessments with instant score calculation, risk level analysis, and history. |
| **Adaptive Quick Check** | `/quick-check/start`<br>`/quick-check/answer`<br>`/quick-check/history` | `QuickCheckModal.tsx` | AI-powered multi-turn conversational check-in generating adaptive follow-up questions and structured risk assessments. |

---

## 📁 Project Structure

```
Waypoint/
├── Frontend/              # React 18 TypeScript client (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components & modals
│   │   ├── pages/         # Route-level application pages
│   │   ├── contexts/      # Theme & global state providers
│   │   ├── hooks/         # Custom React hooks (useApi, useAdmin)
│   │   ├── data/          # Structured JSON data & themes
│   │   └── mockApi.ts     # Primary HTTP request & fallback layer
│   └── README.md
│
├── server/                # Node.js + Express REST backend
│   ├── src/
│   │   ├── chat/          # Prompt templates & context builders
│   │   ├── config/        # Database & environment setup
│   │   ├── controllers/   # Express request handlers
│   │   ├── models/        # Mongoose data models
│   │   ├── routes/        # Express API endpoints
│   │   ├── services/      # AI service (OpenAI / Gemini integration)
│   │   ├── middleware/    # Auth, Admin guard, CORS & Error handling
│   │   └── index.js       # Express server entry point
│   └── README.md
│
└── README.md              # Root project documentation
```

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Clerk account (for authentication)
- OpenAI API key or Google Gemini API key

### 2. Installation
```bash
# Clone repository
git clone https://github.com/yourusername/waypoint.git
cd waypoint

# Install Frontend dependencies
cd Frontend
npm install

# Install Server dependencies
cd ../server
npm install
```

### 3. Run Verification Checks
```bash
# Lint check frontend (0 errors, 0 warnings)
cd Frontend
npm run lint

# TypeScript & Vite build
npm run build

# Syntax check backend server
cd ../server
node --check src/index.js
```

### 4. Start Development Servers
```bash
# Backend Express Server (Port 4000)
cd server
npm run dev

# Frontend Client (Port 5173)
cd Frontend
npm run dev
```
