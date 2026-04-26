"use client"

import { useState, useEffect, useCallback } from "react"
import { meetingsApi } from "@/lib/api-client"
import type { MeetingDetail } from "@/lib/api-client"

/**
 * Fetches and manages state for a single meeting by ID.
 */
export function useMeeting(id: string) {
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await meetingsApi.get(id)
      setMeeting(data.meeting)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load meeting")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) load()
  }, [id, load])

  return { meeting, isLoading, error, reload: load }
}
