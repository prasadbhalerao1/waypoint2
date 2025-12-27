# WayPoint - Campus Mental Health Companion

> **Smart India Hackathon 2025** | AI-powered mental health support platform for Indian college students

WayPoint bridges the gap in college mental health support with AI-guided assistance, confidential counseling booking, peer support forums, and comprehensive wellness resources - all designed specifically for Indian college students.

You can check out the current demo at :-

[`https://waypoint-demo-two.vercel.app`](https://waypoint-demo-two.vercel.app)

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

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Authentication**: Clerk
- **State Management**: React Context API
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk JWT validation
- **AI Integration**: OpenAI API / Google Gemini
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
Waypointdemo2/
├── Frontend/              # React TypeScript client
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level components
│   │   ├── contexts/      # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── data/          # Static JSON data
│   │   └── mockApi.ts     # API adapter (mock/real backend)
│   └── README.md
│
├── server/                # Node.js Express API
│   ├── src/
│   │   ├── chat/          # AI prompt templates
│   │   ├── config/        # Database & config
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, CORS, errors
│   │   ├── utils/         # Helpers & utilities
│   │   └── index.js       # Server entry point
│   └── README.md
│
├── README.md              # This file
└── FEATURES.md            # Detailed feature documentation
```

Every folder contains its own `README.md` explaining the code's purpose.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Clerk account (for authentication)
- OpenAI API key or Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/waypointdemo2.git
   cd waypointdemo2
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd Frontend
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Configure environment variables**
   
   Environment files are pre-configured for both development and production:
   
   **Frontend**:
   - `.env.development` - Already configured for local development
   - `.env.production` - Already configured for Vercel deployment
   - Update `.env.development` if needed (default: `http://localhost:4000/api/v1`)
   
   **Backend**:
   - `.env.development` - Already configured for local development
   - `.env.production` - Already configured for production deployment
   - Add your API keys to `.env.development`:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     CLERK_SECRET_KEY=your_clerk_secret_key
     GEMINI_API_KEY=your_gemini_api_key
     ENCRYPTION_KEY=your_32_byte_encryption_key
     ```
   
   See `DEPLOYMENT_GUIDE.md` for complete configuration details.

4. **Run the application**
   
   **Terminal 1 - Backend**:
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend**:
   ```bash
   cd Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔒 Security & Privacy

- **Data Minimization**: Only essential data is collected and stored
- **Encryption**: AES-256 encryption for sensitive fields (screening results, counselor notes)
- **Authentication**: Clerk-based JWT authentication with session management
- **Authorization**: Role-based access control (Student, Counselor, Admin)
- **PII Redaction**: Personal identifiable information is redacted before AI API calls
- **HTTPS**: All production traffic encrypted in transit
- **Rate Limiting**: API endpoints protected against abuse
- **CORS**: Strict origin whitelisting

## 📝 API Documentation

### Base URL
```
Production: https://your-api-domain.com/api/v1
Development: http://localhost:4000/api/v1
```

### Key Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/user/me` | GET | Get current user profile | Yes |
| `/chat` | POST | Send message to AI assistant | Yes |
| `/screening` | POST | Submit mental health screening | Yes |
| `/bookings` | POST | Book counselor appointment | Yes |
| `/forum` | GET | Get forum posts | Yes |
| `/resources` | GET | Get mental health resources | No |
| `/admin/analytics` | GET | Get platform analytics | Admin only |

See `server/src/routes/` for complete API documentation.

## 🧪 Testing

```bash
# Frontend tests
cd Frontend
npm test

# Backend tests
cd server
npm test
```

## 👥 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for guidelines.

## 📜 License

MIT License - see `LICENSE` file for details.

## 📧 Contact & Support

For questions, issues, or support:
- Open an issue on GitHub
- Email: support@waypoint.edu

## 🌟 Acknowledgments

- Built for **Smart India Hackathon 2025**
- Inspired by the need for accessible mental health support in Indian educational institutions
- Special thanks to all contributors and mental health professionals who provided guidance

---

**⚠️ Disclaimer**: WayPoint is a support tool and does not replace professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a crisis helpline immediately.

**India Crisis Helplines**:
- KIRAN: 1800-599-0019 (24/7, toll-free)
- Vandrevala Foundation: 1860-2662-345 / 9999 666 555 (24/7)
