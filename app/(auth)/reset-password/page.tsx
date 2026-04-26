"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Suspense } from "react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get("token")

  const [loading,         setLoading]         = useState(true)
  const [user,            setUser]            = useState<{ email: string; name: string } | null>(null)
  const [tokenError,      setTokenError]      = useState<string | null>(null)
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting,      setSubmitting]      = useState(false)
  const [success,         setSuccess]         = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenError("Reset token is missing.")
      setLoading(false)
      return
    }
    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.error) { setTokenError(data.error); return }
        setUser(data)
      })
      .catch(() => setTokenError("Could not validate reset link."))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error("Passwords do not match."); return }
    if (password.length < 8)          { toast.error("Password must be at least 8 characters."); return }

    setSubmitting(true)
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { toast.error(data.error ?? "Failed to reset password."); return }
      setSuccess(true)
      toast.success("Password updated!")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#1E4A3D] animate-spin mx-auto" />
          <p className="text-[#6B6560] font-medium">Verifying reset link…</p>
        </div>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
        <Card className="max-w-md w-full border-[#E2DDD5] shadow-xl">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-[#C8522A] mx-auto" />
            <h2 className="text-xl font-bold text-[#1A1814]">Link Invalid or Expired</h2>
            <p className="text-[#6B6560]">{tokenError}</p>
            <Button
              variant="outline"
              className="mt-4 border-[#CBC5BB] text-[#1A1814] hover:bg-[#F0EDE6]"
              onClick={() => router.push("/sign-in")}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
        <Card className="max-w-md w-full border-[#E2DDD5] shadow-xl animate-in zoom-in duration-300">
          <CardContent className="py-12 text-center space-y-6">
            <div className="h-20 w-20 bg-[#1E4A3D] text-white rounded-full flex items-center justify-center shadow-2xl mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[#1A1814]">Password Updated!</h3>
              <p className="text-[#6B6560]">Your password has been changed. You can now sign in.</p>
            </div>
            <Button
              className="w-full h-12 bg-[#1E4A3D] hover:bg-[#15342B] text-white font-bold rounded-xl"
              onClick={() => router.push("/sign-in")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1E4A3D] text-white shadow-xl mb-6">
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-[#1A1814] tracking-tight">Reset Password</h2>
          <p className="text-[#6B6560] mt-2">
            Choose a new password for <span className="font-bold text-[#1A1814]">{user?.email}</span>
          </p>
        </div>

        <Card className="border-[#E2DDD5] shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="h-1.5 bg-[#1E4A3D]" />
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardDescription className="text-[#9C9790] font-medium uppercase text-[10px] tracking-widest">
                Security Requirements
              </CardDescription>
              <CardTitle className="text-sm font-bold text-[#1A1814] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1E4A3D]" /> Minimum 8 characters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#1A1814] uppercase tracking-wider">New Password</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 border-[#E2DDD5] focus:border-[#1E4A3D] focus:ring-[#1E4A3D] rounded-xl"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#1A1814] uppercase tracking-wider">Confirm Password</Label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="h-12 border-[#E2DDD5] focus:border-[#1E4A3D] focus:ring-[#1E4A3D] rounded-xl"
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4 pb-8">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#1E4A3D] hover:bg-[#15342B] text-white font-bold rounded-xl shadow-lg shadow-[#1E4A3D]/20"
              >
                {submitting
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…</>
                  : "Set New Password"
                }
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[#9C9790] text-xs uppercase tracking-widest font-bold">
          Secured by AttendSync Enterprise
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <Loader2 className="h-10 w-10 text-[#1E4A3D] animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
