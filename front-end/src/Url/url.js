// Set VITE_API_URL in .env (see .env.example). Falls back to localhost for local dev.
export const url = import.meta.env.VITE_API_URL || "http://localhost:3030";