"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, Lock } from "lucide-react"
import { toast } from "sonner"

export default function SetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(true)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing.")
      setVerifying(false)
      setLoading(false)
      return
    }

    authApi.verifyInvite(token)
      .then((data) => {
        setUser(data)
        setVerifying(false)
        setLoading(false)
      })
      .catch((err: any) => {
        setError(err.message || "Invalid or expired invitation link.")
        setVerifying(false)
        setLoading(false)
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }

    setSubmitting(true)
    try {
      await authApi.completeInvite({ token: token!, password })
      setSuccess(true)
      toast.success("Password set successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to set password.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#1E4A3D] animate-spin mx-auto" />
          <p className="text-[#6B6560] font-medium font-sans">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
        <Card className="max-w-md w-full border-[#E2DDD5] shadow-xl">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-[#C8522A] mx-auto" />
            <h2 className="text-xl font-bold text-[#1A1814]">Invalid Invitation</h2>
            <p className="text-[#6B6560]">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-[#CBC5BB] text-[#1A1814] hover:bg-[#F0EDE6]"
              onClick={() => router.push("/sign-in")}
            >
              Return to Login
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
            <div className="relative">
              <div className="h-20 w-20 bg-[#1E4A3D] text-white rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[#1A1814]">All Set!</h3>
              <p className="text-[#6B6560]">Your account is now active. You can proceed to log in.</p>
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
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-[#1A1814] tracking-tight">Set Your Password</h2>
          <p className="text-[#6B6560] mt-2">Welcome, <span className="font-bold text-[#1A1814]">{user?.name}</span>. Create a secure password for your account.</p>
        </div>

        <Card className="border-[#E2DDD5] shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="h-1.5 bg-[#1E4A3D]" />
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-6">
              <CardDescription className="text-[#9C9790] font-medium uppercase text-[10px] tracking-widest">Security Requirements</CardDescription>
              <CardTitle className="text-sm font-bold text-[#1A1814] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#1E4A3D]" /> Minimum 8 characters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-[#1A1814] uppercase tracking-wider">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email} 
                  disabled 
                  className="h-12 bg-[#F5F3EE] border-[#E2DDD5] text-[#1A1814] font-medium rounded-xl opacity-70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-[#1A1814] uppercase tracking-wider">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-[#E2DDD5] focus:border-[#1E4A3D] focus:ring-[#1E4A3D] rounded-xl"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-xs font-bold text-[#1A1814] uppercase tracking-wider">Confirm Password</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-[#E2DDD5] focus:border-[#1E4A3D] focus:ring-[#1E4A3D] rounded-xl"
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4 pb-8">
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-12 bg-[#1E4A3D] hover:bg-[#15342B] text-white font-bold rounded-xl shadow-lg shadow-[#1E4A3D]/20 transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating Account...
                  </>
                ) : (
                  "Activate Account"
                )}
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
