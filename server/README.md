# WayPoint Server API

Express.js REST API powering WayPoint’s backend.

## ⚙️ Responsibilities

- Authentication and session validation (`@clerk/express`)
- REST endpoints for chat, booking, screening, resources, forums, and admin management
- Mongoose models that persist user data, bookings, screening results, and forum posts in MongoDB
- Middlewares for admin-only access, CORS origin validation, rate-limiting & error handling
- Service layer that wraps external AI APIs (OpenAI `gpt-4o-mini` / Google Gemini) and notification services

## 🌐 API Security & Auth Specification

- **Authentication**: Verified via `@clerk/express` middleware (`requireAuth()`).
- **Authorization Header**: Expects `Authorization: Bearer <clerk_jwt_token>`.
- **CORS & Credentials**: Configured for `credentials: true` matching frontend origin requests.
- **Admin Authorization**: Enforced via `requireAdmin` middleware checking verified admin emails (`prasad9a38@gmail.com`, `waypointplatform@gmail.com`).

## 🛠️ Development

```bash
cd server
npm install
cp .env.example .env  # Add environment secrets locally
npm run dev           # Start nodemon server (hot-reloads on changes)
```

## 📁 Key Folders & Architecture

| Folder | Purpose |
| :--- | :--- |
| `src/chat` | Prompt templates, CBT context builders, & chat helpers |
| `src/config` | MongoDB connection (`db.js`) & environment config |
| `src/controllers` | Express request handlers (thin controllers) |
| `src/middleware` | Auth guards (`auth.js`), admin guards (`adminAuth.js`), CORS & error handling |
| `src/models` | Mongoose schemas (`User.js`, `Booking.js`, `Screening.js`, `Forum.js`, etc.) |
| `src/routes` | Express route definitions (`user.js`, `chat.js`, `bookings.js`, `resources.js`, `forum.js`, `admin.js`, `screening.js`, `quickCheck.js`) |
| `src/services` | Business logic, OpenAI/Gemini integration, and email dispatchers |
| `src/utils` | Seed scripts and miscellaneous helpers |

## 📋 Express Route Modules (`/api/v1`)

| Route Module | Endpoints | Controller |
| :--- | :--- | :--- |
| `/api/v1/user` | GET/PATCH `/me`, PATCH `/theme`, PATCH `/mood`, POST `/consent`, POST `/complete-onboarding`, GET `/stats` | `userController.js` |
| `/api/v1/chat` | POST `/`, GET/DELETE `/history` | `chatController.js` |
| `/api/v1/bookings` | GET `/counsellors/available`, POST `/match`, POST `/`, GET/PATCH `/:id` | `bookingController.js` |
| `/api/v1/resources` | GET `/`, GET `/:id`, POST `/:id/complete`, POST/PATCH/DELETE `/:id` | `resourceController.js` |
| `/api/v1/forum` | GET/POST `/posts`, POST `/posts/:id/comments`, POST `/posts/:id/like`, POST `/comments/:id/like`, POST `/posts/:id/flag` | `forumController.js` |
| `/api/v1/admin` | GET `/analytics`, GET `/alerts`, GET/PATCH `/counsellors`, GET `/flagged-posts`, PATCH `/posts/:id/moderate` | `adminController.js` |
| `/api/v1/screening` | GET `/questions`, POST `/`, GET `/history` | `screeningController.js` |
| `/api/v1/quick-check` | POST `/start`, POST `/answer`, GET `/history` | `quickCheckController.js` |

## 🧪 Running Tests & Verification

```bash
# Syntax check server entry point
node --check src/index.js

# Run test suite
npm test
```

## 🐳 Deployment

A `Dockerfile` and `docker-compose.yml` are provided. Build & run containerized:

```bash
docker compose up --build
```
