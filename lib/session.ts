import { cache } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"

/**
 * Cached getServerSession — deduplicates calls within a single React request tree.
 * Layout + every child page can call this freely; it only runs once per HTTP request.
 */
export const getSession = cache(() => getServerSession(authOptions))
