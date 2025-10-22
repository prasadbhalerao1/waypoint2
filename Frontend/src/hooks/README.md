# hooks

Custom React hooks that encapsulate reusable logic such as admin-privilege detection or typed API wrappers.

* `useAdmin` – Checks current user email against an allow-list obtained from Clerk.
* `useApi` – Axios instance configured with auth headers pointing to the Express backend.
