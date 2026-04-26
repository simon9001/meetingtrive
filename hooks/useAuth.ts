"use client"

import { useSession, signIn, signOut } from "next-auth/react"

/**
 * Convenience wrapper around next-auth's useSession.
 * Returns typed session data and auth actions.
 */
export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user as
    | {
        id: string
        email: string
        name: string
        role: "ADMIN" | "COORDINATOR" | "ATTENDEE"
        orgId: string
      }
    | undefined

  return {
    user,
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signIn,
    signOut,
  }
}
