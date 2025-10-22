# middleware

Custom Express middleware utilities:

* `adminAuth.js` – Checks JWT user email against `ADMIN_EMAILS` list and returns 403 if unauthorised. Share same emails as `useAdmin` hook.
* `clerkAuth.js` – Verifies Clerk session token, attaches user to `req.user`.
* `cors.js` – CORS whitelist & headers.
* `errorHandler.js` – Final error-handling middleware that standardises JSON error responses.
