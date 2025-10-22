# server

Express API powering WayPoint’s backend.

## Responsibilities

- Authentication and session validation
- REST endpoints for chat, booking, screening, forums
- WebSocket gateway for real-time chat
- Mongoose models that persist user data in MongoDB
- Middlewares for admin-only access, rate-limiting & error handling
- Service layer that wraps external APIs (OpenAI, email, payment)

## Development

```bash
cd server
npm install
cp .env.example .env  # add secrets locally
npm run dev            # nodemon hot-reloads on changes
```

## Key Folders

| Folder        | Purpose                                   |
|---------------|-------------------------------------------|
| `src/chat`    | Prompt templates & chat-specific helpers  |
| `src/config`  | DB connection & global config             |
| `src/models`  | Mongoose schemas                          |
| `src/routes`  | Express route definitions                 |
| `src/controllers` | Request handlers (thin controllers)  |
| `src/services` | Business logic, AI calls, emails        |
| `src/middleware` | Auth, admin guard, error middleware    |
| `src/utils`   | Seed scripts and miscellaneous helpers    |

## Running Tests

```bash
npm test
```

> Tests are a work-in-progress; contributions welcome!

## Deployment

A `Dockerfile` and `docker-compose.yml` are provided. Build & run:

```bash
docker compose up --build
```
