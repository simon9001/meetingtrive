import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token
      },
    },
    pages: {
      signIn: "/sign-in",
    },
  }
)

export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/meetings/:path*",
    "/api/internal/:path*",
  ],
}
