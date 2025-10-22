# routes

Express routers that map HTTP endpoints to controller actions. All routes are prefixed in `src/index.js`.

| File            | Base path    | Purpose                          |
|-----------------|--------------|----------------------------------|
| `user.js`       | `/api/user`  | User profile endpoints           |
| `chat.js`       | `/api/chat`  | AI chat completions              |
| `bookings.js`   | `/api/book`  | Counsellor booking CRUD          |
| `screening.js`  | `/api/screen`| Mental-health assessments        |
| `forum.js`      | `/api/forum` | Peer support forum               |
| `resources.js`  | `/api/res`   | Knowledge-base resources         |
| `quickCheck.js` | `/api/quick` | One-question mental check        |
| `admin.js`      | `/api/admin` | Admin-only analytics             |
