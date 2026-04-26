import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY,
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          })

          if (!res.ok) return null

          const { user } = await res.json() as {
            user: { id: string; email: string; name: string; role: string; orgId: string }
          }

          return user
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = (user as any).id
        token.role  = (user as any).role
        token.orgId = (user as any).orgId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id    = token.id
        ;(session.user as any).role  = token.role
        ;(session.user as any).orgId = token.orgId
      }
      return session
    },
  },

  pages: { signIn: "/sign-in" },

  secret: process.env.NEXTAUTH_SECRET,
}
