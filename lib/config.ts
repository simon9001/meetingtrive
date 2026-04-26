/**
 * Central backend URL config.
 * - Production (Netlify): set NEXT_PUBLIC_BACKEND_URL in netlify.toml or dashboard
 * - Local dev: set NEXT_PUBLIC_BACKEND_URL in .env.local, or falls back to localhost:4000
 *
 * To switch the dev URL, change the fallback below.
 */

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://45a3-41-90-172-95.ngrok-free.app"
    : "http://localhost:4000")
