# WayPoint - Campus Mental Health Companion

A polished, hackathon-ready React (Vite) + Tailwind frontend for **WayPoint** that provides AI-guided mental health support, theme personalization, and music therapy features for college students.

## Features

- 🎨 **Runtime Theme Personalization** - 4 themes with CSS variables
- 🎵 **Music Therapy Demo** - Studio theme with audio controls
- 🧠 **Mood-Based Support** - Personalized responses based on mood
- 💾 **State Persistence** - localStorage for theme/mood/progress
- 🔌 **Backend Integration** - Mock API with real backend support
- ♿ **Accessibility** - ARIA attributes and keyboard navigation
- 📱 **Responsive Design** - Mobile-first approach

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Configuration

### Backend Integration

The app supports both mock and real backend modes:

**Mock Mode (Default):**
```typescript
// In src/mockApi.ts
const USE_MOCK_API = true;
```

**Real Backend Mode:**
```typescript
// In src/mockApi.ts
const USE_MOCK_API = false;
const API_BASE_URL = 'https://your-api.com/api/v1';
```

Set environment variable:
```bash
VITE_API_BASE_URL=https://your-api.com/api/v1
```

## localStorage Keys

The app uses these localStorage keys:

- `wp_theme` - Current theme ID (default, home_ground, studio, library)
- `wp_mood` - User mood (1-5 scale)
- `wp_progress_beats` - Progress points for gamification
- `wp_consents` - Privacy consent preferences
- `waypoint-onboarded` - Onboarding completion status

## Themes

### Available Themes

1. **Default (WayPoint Classic)** - Green palette (`#10B981`)
2. **Home Ground** - Sports theme with teal/orange
3. **Studio** - Music theme with purple/pink + Music Therapy
4. **Library** - Reading theme with dark green/gold

### Theme Structure

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

## User Flow

1. **Privacy & Consent** → Choose data sharing preferences
2. **Theme Selection** → Pick theme or "Skip — Use WayPoint Classic"
3. **Mood Selection** → Rate mood 1-5 (Overwhelmed → Great)
4. **Home** → Personalized dashboard with theme-specific features

## Acceptance Tests

### Test 1: Fresh Session & Classic Theme
```bash
# Clear localStorage or open incognito
# Navigate to app
# Complete onboarding: Privacy → Theme → Click "Skip — Use WayPoint Classic"
# Verify:
# - localStorage.wp_theme === "default"
# - CSS var --wp-primary === '#10B981'
# - UI shows green palette
```

### Test 2: Mood Selection & Navigation
```bash
# On Mood page: select mood 1-5 → Continue
# Verify:
# - localStorage.wp_mood is set
# - Navigate to /home (no Consent redirect)
```

### Test 3: Studio Theme & Music Therapy
```bash
# Select Studio theme → Mood → Home
# Verify:
# - localStorage.wp_theme === "studio"
# - UI shows purple/pink palette
# - MusicTherapyCard is visible
# - Can play/pause/stop audio
# - Progress increments on completion
```

### Test 4: Progress Persistence
```bash
# Complete music therapy session
# Verify:
# - localStorage.wp_progress_beats increments
# - Toast shows "Nice beat! +10 Beats"
# - Progress indicator shows on Home
```

### Test 5: Theme Switching
```bash
# Switch between themes
# Verify:
# - CSS variables update immediately
# - No color bleed between themes
# - Full return to green on Classic
```

### Test 6: Backend Integration (if available)
```bash
# Set USE_MOCK_API=false
# Perform theme/mood updates
# Verify:
# - API calls are made
# - Responses applied to UI
# - Graceful fallback on errors
```

### Test 7: Accessibility
```bash
# Navigate using only keyboard (Tab, Enter, Space)
# Verify:
# - All interactive elements are focusable
# - Focus indicators are visible
# - ARIA labels are present
# - Screen reader friendly
```

### Test 8: Edge Cases
```bash
# Test localStorage blocked
# Verify:
# - App shows banner notification
# - Continues with in-memory data
# - No crashes

# Test audio unavailable
# Verify:
# - Shows "Audio unavailable" message
# - No crashes
```

## API Contract

### Authentication
```typescript
POST /api/v1/auth/signup
Body: { email: string, phone: string, otp: string }
Response: { token: string, user: User }
```

### Theme & Mood
```typescript
PATCH /api/v1/user/me/theme
Body: { theme: string }
Response: { theme: string }

PATCH /api/v1/user/me/mood
Body: { mood: number }
Response: { mood: number }
```

### Chat
```typescript
POST /api/v1/chat
Body: { message: string, theme: string, mood: number }
Response: { reply: string, actions: string[], sources: string[] }
```

### Exercise Tracking
```typescript
POST /api/v1/exercise/attempt
Body: { exercise_id: string, start_ts: string, end_ts: string, duration: number }
Response: { xp_awarded: number, progress_key: string }
```

## Troubleshooting

### Common Issues

**Mood → Continue returns to Consent:**
- Check for unconditional redirects in App.tsx
- Ensure `navigate('/home', { replace: true })` is used

**CSS variables not applying:**
- Verify ThemeProvider sets variables on `document.documentElement`
- Check Tailwind config maps tokens to CSS variables

**Audio 404 errors:**
- Ensure audio files exist in `public/assets/`
- Check file names match exactly

**Theme colors appear static:**
- Verify Tailwind config includes CSS variable mappings
- Check browser dev tools for CSS variable values

### Debug Mode

Enable debug logging:
```typescript
// In src/mockApi.ts
const DEBUG = true;
```

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Theme)
├── data/              # Static data (themes.json)
├── pages/             # Route components
├── mockApi.ts         # API layer with mock/real backend
└── main.tsx           # App entry point
```

### Key Components
- `ThemeProvider` - Manages theme state and CSS variables
- `ThemeSelector` - Theme selection with Skip option
- `MoodRating` - 1-5 mood scale selection
- `MusicTherapyCard` - Audio player for Studio theme
- `Landing` - Home page with mood-based messaging

## Security & Privacy

- All sensitive data requires explicit consent
- Client-side encryption simulation for screening data
- JWT tokens for authentication (if backend available)
- HTTPS required in production
- No personal data stored without consent

## License

MIT License - Built for Smart India Hackathon 2024