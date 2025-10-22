# Waypoint Mental Health Platform

WayPoint is a full-stack web application that offers students in India an empathetic, AI-assisted mental-health companion together with self-help tools and counsellor support.

## Project Highlights

- **AI Assistant** – RAG-powered chat that delivers culturally-aware CBT techniques and crisis guidance.
- **Mental-Health Toolkit** – Screening forms (PHQ-9, GAD-7), breathing & grounding exercises, music therapy and a curated resource hub.
- **Peer Support Forum** – Community discussion board with moderation.
- **Counsellor Booking** – Secure booking flow that matches students with verified counsellors.
- **Admin Dashboard** – Usage analytics & content management (restricted to authorised admins).

## Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Clerk auth |
| Backend   | Node.js, Express, MongoDB (Mongoose), OpenAI API, JWT |
| DevOps    | Docker, Docker Compose, Vercel (frontend), Render (backend) |

## Repository Structure

```
Frontend/    # React client (Vite)
server/      # Node/Express API & socket server
```

Each folder (and their sub-folders) contains a `README.md` that briefly documents its purpose.

## Local Development (quick start)

1. Clone the repo & install deps:

   ```bash
   npm i -w Frontend && npm i -w server
   ```
2. Copy the `.env.example` files in each workspace, fill out the required keys.
3. Run both stacks concurrently:

   ```bash
   npm run dev -w server & npm run dev -w Frontend
   ```

Visit `http://localhost:5173` in the browser.

## Security & Privacy

WayPoint stores the minimum personal data required for operation. Sensitive values (API keys, database URIs, admin emails) are **never** committed to the repository – provide them through environment variables only.

## Contributing

Please read `CONTRIBUTING.md` (coming soon) before opening issues or pull requests.
