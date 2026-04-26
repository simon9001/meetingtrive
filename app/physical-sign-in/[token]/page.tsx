"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SignatureCanvas } from "@/components/signature/signature-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2,
  Hash, PenTool, Type, Upload, AlertCircle, User, ShieldCheck
} from "lucide-react"
import { physicalApi } from "@/lib/api-client"
import { uploadSignatureToCloudinary } from "@/lib/upload-signature"

type Step = "gps-check" | "gps-error" | "geo-denied" | "staff-id" | "signature" | "success"

export default function PhysicalSignInPage() {
  const params = useParams()
  const meetingId = params.token as string   // URL: /physical-sign-in/[meetingId]/[qrToken]
  // Next.js dynamic segment is named [token] but the folder is [token]
  // The actual meetingId and qrToken come from params
  // Since this is /physical-sign-in/[token], token = meetingId/qrToken is caught differently
  // We'll parse from window.location if needed, but the page receives params.token as meetingId
  // when the file is at /physical-sign-in/[token]/page.tsx and the URL is /physical-sign-in/:meetingId/:qrToken
  // We need to refactor to have /physical-sign-in/[meetingId]/[qrToken]/page.tsx
  // For now, read both from URL
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [resolvedMeetingId, setResolvedMeetingId] = useState<string | null>(null)

  const [step, setStep] = useState<Step>("gps-check")
  const [distance, setDistance] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [meetingInfo, setMeetingInfo] = useState<{
    meetingTitle: string
    venueName?: string
    organisationName: string
    staffIdGateEnabled: boolean
  } | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [staffIdInput, setStaffIdInput] = useState("")
  const [profile, setProfile] = useState<{ name?: string; designation?: string; department?: string } | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("draw")
  const [typedName, setTypedName] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestDesignation, setGuestDesignation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [signedAt, setSignedAt] = useState<string | null>(null)
  const [sigHash, setSigHash] = useState<string | null>(null)

  // Parse meetingId and qrToken from URL path
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean)
    // /physical-sign-in/[meetingId]/[qrToken]
    if (parts.length >= 3) {
      setResolvedMeetingId(parts[1])
      setQrToken(parts[2])
    }
  }, [])

  // Get GPS and validate with backend
  useEffect(() => {
    if (!resolvedMeetingId || !qrToken) return

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.")
      setStep("gps-error")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        setLat(userLat)
        setLng(userLng)

        try {
          const data = await physicalApi.validateQR(resolvedMeetingId, qrToken, userLat, userLng)
          setMeetingInfo({
            meetingTitle: data.meetingTitle,
            venueName: data.venueName,
            organisationName: data.organisationName,
            staffIdGateEnabled: data.staffIdGateEnabled,
          })
          setStep(data.staffIdGateEnabled ? "staff-id" : "signature")
        } catch (e: any) {
          if (e.message?.includes("outside") || e.message?.includes("geo")) {
            setStep("geo-denied")
          } else {
            setGpsError(e.message)
            setStep("gps-error")
          }
        }
      },
      (err) => {
        setGpsError(err.message)
        setStep("gps-error")
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [resolvedMeetingId, qrToken])

  const handleVerifyStaff = async () => {
    if (!staffIdInput.trim() || !resolvedMeetingId || !qrToken) return
    setIsLoading(true)
    setErrorMsg(null)
    try {
      // Quick lookup via staff API
      const res = await fetch(
        `/api/staff/lookup?orgId=default&staffId=${encodeURIComponent(staffIdInput.trim())}`
      )
      const data = await res.json() as any
      if (data.staff) {
        setProfile({ name: data.staff.fullName, designation: data.staff.designation, department: data.staff.department })
      }
      setStep("signature")
    } catch {
      // If lookup fails, allow manual entry
      setStep("signature")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSignature(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const getSignatureDataUrl = (): string | null => {
    if (activeTab === "draw") return signature
    if (activeTab === "type" && typedName.trim()) {
      const canvas = document.createElement("canvas")
      canvas.width = 400; canvas.height = 100
      const ctx = canvas.getContext("2d")!
      ctx.font = "italic 40px Georgia, serif"
      ctx.fillStyle = "#1a1a1a"
      ctx.fillText(typedName, 20, 65)
      return canvas.toDataURL()
    }
    if (activeTab === "upload") return signature
    return null
  }

  const handleSubmit = async () => {
    if (!resolvedMeetingId || !qrToken || !lat || !lng) return
    const sigDataUrl = getSignatureDataUrl()
    if (!sigDataUrl) { setErrorMsg("Please provide a signature."); return }

    setIsLoading(true)
    setErrorMsg(null)
    try {
      let signatureUrl = sigDataUrl
      if (sigDataUrl.startsWith("data:")) {
        signatureUrl = await uploadSignatureToCloudinary(sigDataUrl)
      }
      const result = await physicalApi.submitSignature(resolvedMeetingId, qrToken, {
        qrToken,
        signatureDataUrl: signatureUrl,
        attendeeLat: lat,
        attendeeLng: lng,
        saveToLibrary: true,
        staffId: staffIdInput.trim() || undefined,
        guestName: profile?.name ?? (guestName || undefined),
        guestDesignation: profile?.designation ?? (guestDesignation || undefined),
      })
      setSignedAt(result.signedAt)
      setSigHash(result.signatureHash)
      setStep("success")
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "gps-check") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <h2 className="text-xl font-bold">Verifying Location…</h2>
          <p className="text-muted-foreground text-sm">Allow location access to proceed.</p>
        </div>
      </div>
    )
  }

  if (step === "gps-error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardContent className="py-10 text-center space-y-4">
            <AlertCircle className="h-14 w-14 text-destructive mx-auto" />
            <h2 className="text-xl font-black">Location Error</h2>
            <p className="text-muted-foreground text-sm">{gpsError}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "geo-denied") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl overflow-hidden">
          <div className="bg-red-500 text-white py-8 text-center">
            <ShieldAlert className="h-14 w-14 mx-auto mb-3" />
            <h2 className="text-xl font-black">Outside Meeting Venue</h2>
          </div>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Your location is outside the designated meeting area. Please move closer to the venue and try again.
            </p>
            {distance !== null && (
              <div className="bg-muted p-3 rounded-xl flex items-center justify-center gap-2 font-bold">
                <Navigation className="h-4 w-4 text-primary" />
                {Math.round(distance)}m from venue
              </div>
            )}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Location Check
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full border-none shadow-2xl bg-card/80 backdrop-blur-2xl">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto bg-green-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
            <MapPin className="h-7 w-7 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-black">{meetingInfo?.meetingTitle ?? "On-Site Sign-In"}</CardTitle>
          <CardDescription>
            {meetingInfo?.venueName ?? "Venue verified"} — {meetingInfo?.organisationName}
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs font-bold text-green-600">Location verified</span>
          </div>
        </CardHeader>

        <CardContent className="px-6 lg:px-10">
          {errorMsg && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Staff ID gate */}
          {step === "staff-id" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label className="text-base font-bold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" /> Staff ID
                </Label>
                <Input
                  placeholder="e.g. EB/2024/0042"
                  value={staffIdInput}
                  onChange={(e) => setStaffIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyStaff()}
                  className="h-12 text-lg border-2 rounded-xl text-center tracking-widest uppercase"
                />
              </div>
              <Button onClick={handleVerifyStaff} disabled={isLoading || !staffIdInput.trim()} className="w-full h-12 font-bold">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue
              </Button>
            </div>
          )}

          {/* Signature step */}
          {step === "signature" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Profile / manual entry */}
              {profile ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase">{profile.name}</div>
                    <div className="text-xs text-muted-foreground">{profile.designation}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm font-bold">Full Name</Label>
                    <Input placeholder="Your full name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="border-2 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-bold">Designation / Job Title</Label>
                    <Input placeholder="e.g. Senior Engineer" value={guestDesignation} onChange={(e) => setGuestDesignation(e.target.value)} className="border-2 rounded-xl" />
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 h-11 rounded-xl bg-muted/30 p-1 border">
                  <TabsTrigger value="draw" className="rounded-lg font-bold text-xs"><PenTool className="h-3.5 w-3.5 mr-1" /> Draw</TabsTrigger>
                  <TabsTrigger value="type" className="rounded-lg font-bold text-xs"><Type className="h-3.5 w-3.5 mr-1" /> Type</TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-lg font-bold text-xs"><Upload className="h-3.5 w-3.5 mr-1" /> Upload</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="draw">
                    <SignatureCanvas onSave={setSignature} onClear={() => setSignature(null)} />
                  </TabsContent>
                  <TabsContent value="type">
                    <Input
                      placeholder="Type your name…"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="h-14 text-2xl font-[cursive] text-center border-2 rounded-xl"
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                    <label className="flex flex-col items-center py-8 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/20">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm font-bold">Upload image</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} />
                    </label>
                    {signature && activeTab === "upload" && (
                      <img src={signature} className="mt-3 h-14 mx-auto object-contain" alt="Signature" />
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="w-full h-12 font-bold">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Signing…" : "Complete Sign-In"}
              </Button>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="flex flex-col items-center py-8 space-y-5 animate-in zoom-in duration-500">
              <div className="h-20 w-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black">Signed In!</h3>
                <p className="text-muted-foreground text-sm">Your attendance has been recorded.</p>
              </div>
              <div className="w-full bg-muted/30 rounded-xl border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs font-bold uppercase">Time</span>
                  <span className="font-semibold">
                    {signedAt ? new Date(signedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }) : "—"}
                  </span>
                </div>
                {sigHash && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs font-bold uppercase">Hash</span>
                    <span className="font-mono text-[10px] opacity-50">{sigHash.slice(0, 16)}…</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 border-t py-4 rounded-b-xl">
          <ShieldCheck className="h-3.5 w-3.5" /> Geo-Verified Attendance
        </CardFooter>
      </Card>
    </div>
  )
}
