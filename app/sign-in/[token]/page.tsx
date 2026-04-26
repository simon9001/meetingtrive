"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { SignatureCanvas } from "@/components/signature/signature-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2, User, Hash, PenTool, Type, Upload,
  Camera, ShieldCheck, AlertCircle, Loader2, Library
} from "lucide-react"
import { signInApi, type SignInParticipant } from "@/lib/api-client"
import { uploadSignatureToCloudinary } from "@/lib/upload-signature"

type Step = "loading" | "error" | "staff-id" | "signature" | "success"

export default function SignInPortalPage() {
  const params = useParams()
  const token = params.token as string
  const { data: session } = useSession()

  const [step, setStep] = useState<Step>("loading")
  const [participant, setParticipant] = useState<SignInParticipant | null>(null)
  const [profile, setProfile] = useState<{ fullName?: string; designation?: string; department?: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [staffIdInput, setStaffIdInput] = useState("")
  const [signature, setSignature] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("draw")
  const [typedName, setTypedName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)
  const [sigHash, setSigHash] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [extractingPhoto, setExtractingPhoto] = useState(false)

  // Load participant info on mount
  useEffect(() => {
    signInApi
      .getParticipant(token)
      .then((data) => {
        setParticipant(data.participant)
        setProfile({
          fullName: data.participant.prefillName ?? undefined,
          designation: data.participant.prefillDesignation ?? undefined,
          department: data.participant.prefillDepartment ?? undefined,
        })
        setStep(data.participant.staffIdGateEnabled ? "staff-id" : "signature")
      })
      .catch((e: Error) => {
        setErrorMsg(e.message)
        setStep("error")
      })
  }, [token])

  // Camera cleanup
  useEffect(() => {
    return () => { cameraStream?.getTracks().forEach((t) => t.stop()) }
  }, [cameraStream])

  const handleVerifyStaff = async () => {
    if (!staffIdInput.trim()) return
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await signInApi.verifyStaff(token, staffIdInput.trim())
      if (data.profile) {
        setProfile({
          fullName: data.profile.fullName,
          designation: data.profile.designation,
          department: data.profile.department,
        })
      }
      setStep("signature")
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const activateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setCameraStream(stream)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setErrorMsg("Could not access camera. Check permissions.")
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedPhoto(dataUrl)
    cameraStream?.getTracks().forEach((t) => t.stop())
    setCameraStream(null)
    extractSignatureFromPhoto(dataUrl)
  }

  const extractSignatureFromPhoto = async (imageData: string) => {
    setExtractingPhoto(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
      const res = await fetch(`${backendUrl}/api/ai/signatures/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })
      const data = await res.json() as { image?: string; error?: string }
      if (data.image) setSignature(data.image)
    } catch {
      setSignature(capturedPhoto)
    } finally {
      setExtractingPhoto(false)
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
    if (activeTab === "upload" || activeTab === "photo") return signature
    return null
  }

  const handleSubmit = async (manualSig?: string) => {
    const sigDataUrl = manualSig || getSignatureDataUrl()
    if (!sigDataUrl) {
      setErrorMsg("Please provide a signature before submitting.")
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    try {
      let signatureUrl = sigDataUrl
      if (sigDataUrl.startsWith("data:")) {
        signatureUrl = await uploadSignatureToCloudinary(sigDataUrl)
      }
      const result = await signInApi.submit(token, {
        signatureDataUrl: signatureUrl,
        saveToLibrary: true,
        fullName: profile?.fullName,
        designation: profile?.designation,
        department: profile?.department,
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

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your attendance form…</p>
        </div>
      </div>
    )
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-xl font-black">Link Unavailable</h2>
            <p className="text-muted-foreground">{errorMsg}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full border-none shadow-2xl bg-card/80 backdrop-blur-2xl">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black">{participant?.meetingTitle}</CardTitle>
          <CardDescription>
            {participant?.dayLabel ? <span className="font-semibold">{participant.dayLabel} — </span> : ""}
            {participant?.organisationName}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 lg:px-10 min-h-[360px]">
          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Step 1: Staff ID */}
          {step === "staff-id" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <Label htmlFor="staffId" className="text-base font-bold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" /> Staff ID
                </Label>
                <Input
                  id="staffId"
                  placeholder="e.g. EB/2024/0042"
                  value={staffIdInput}
                  onChange={(e) => setStaffIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyStaff()}
                  className="h-12 text-lg rounded-xl border-2 text-center tracking-widest uppercase"
                  autoFocus
                />
                <p className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Your Staff ID is required to verify your identity.
                </p>
              </div>
              <Button
                onClick={handleVerifyStaff}
                disabled={isLoading || !staffIdInput.trim()}
                size="lg"
                className="w-full h-12 rounded-xl font-bold"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Verifying…" : "Verify Identity"}
              </Button>
            </div>
          )}

          {/* Step 2: Signature */}
          {step === "signature" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Form */}
              <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Full Name</Label>
                    <Input 
                      value={profile?.fullName ?? ""} 
                      onChange={e => setProfile(p => ({...p!, fullName: e.target.value}))}
                      className="h-9 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Email Address</Label>
                    <Input 
                      value={participant?.prefillEmail ?? "—"} 
                      readOnly
                      className="h-9 text-sm bg-muted/50 cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Designation</Label>
                    <Input 
                      value={profile?.designation ?? ""} 
                      onChange={e => setProfile(p => ({...p!, designation: e.target.value}))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Department</Label>
                    <Input 
                      value={profile?.department ?? ""} 
                      onChange={e => setProfile(p => ({...p!, department: e.target.value}))}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl bg-muted/30 p-1 border">
                  <TabsTrigger value="draw" className="rounded-lg font-bold text-xs">
                    <PenTool className="h-3.5 w-3.5 mr-1" /> Draw
                  </TabsTrigger>
                  <TabsTrigger value="type" className="rounded-lg font-bold text-xs">
                    <Type className="h-3.5 w-3.5 mr-1" /> Type
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-lg font-bold text-xs">
                    <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="rounded-lg font-bold text-xs">
                    <Camera className="h-3.5 w-3.5 mr-1" /> Photo
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="draw">
                    <SignatureCanvas onSave={setSignature} onClear={() => setSignature(null)} />
                  </TabsContent>

                  <TabsContent value="type" className="space-y-3">
                    <Input
                      placeholder="Type your full name…"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="h-14 text-2xl font-[cursive] text-center border-2 border-primary/20 rounded-xl"
                    />
                    <p className="text-xs text-center text-muted-foreground italic">
                      Rendered in a signature-style font.
                    </p>
                  </TabsContent>

                  <TabsContent value="upload">
                    <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-2xl bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
                      <p className="text-sm font-bold">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} />
                    </label>
                    {signature && activeTab === "upload" && (
                      <img src={signature} className="mt-3 h-16 mx-auto object-contain" alt="Uploaded signature" />
                    )}
                  </TabsContent>

                  <TabsContent value="photo" className="space-y-3">
                    {!cameraStream && !capturedPhoto && (
                      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-2xl bg-primary/5 border-primary/20">
                        <Camera className="h-10 w-10 text-primary mb-3" />
                        <p className="text-sm font-bold text-primary">AI Signature Extraction</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center max-w-[220px]">
                          Take a photo of a paper signature. AI removes the background automatically.
                        </p>
                        <Button onClick={activateCamera} variant="outline" size="sm" className="mt-3">
                          Activate Camera
                        </Button>
                      </div>
                    )}
                    {cameraStream && (
                      <div className="space-y-2">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border-2" />
                        <Button onClick={capturePhoto} className="w-full">Capture Signature</Button>
                      </div>
                    )}
                    {extractingPhoto && (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">Extracting signature…</span>
                      </div>
                    )}
                    {signature && activeTab === "photo" && !extractingPhoto && (
                      <img src={signature} className="mt-3 h-16 mx-auto object-contain" alt="Extracted signature" />
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              {/* Saved library */}
              {participant?.signatureLibrary && participant.signatureLibrary.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Library className="h-3.5 w-3.5" /> Saved Signatures
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {participant.signatureLibrary.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => { setSignature(url); setActiveTab("upload") }}
                        className="border-2 rounded-lg p-1 hover:border-primary transition-colors"
                      >
                        <img src={url} className="h-8 w-20 object-contain" alt={`Saved ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Sign for Logged in Users */}
              {session && participant?.signatureLibrary && participant.signatureLibrary.length > 0 && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase">Logged in as {session.user?.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Auto-sign enabled</span>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-md"
                    onClick={() => {
                      handleSubmit(participant.signatureLibrary[0])
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Library className="mr-2 h-4 w-4" />}
                    {isLoading ? "Signing..." : "Quick Sign with Saved Signature"}
                  </Button>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Recording attendance…" : "Complete Attendance"}
              </Button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in zoom-in duration-500">
              <div className="relative">
                <div className="h-20 w-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="absolute -inset-3 rounded-full border-4 border-green-500/20 animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black">Attendance Recorded!</h3>
                <p className="text-muted-foreground">Your signature has been saved securely.</p>
              </div>
              <div className="w-full bg-muted/30 rounded-2xl border p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold uppercase text-xs tracking-wide">Name</span>
                  <span className="font-semibold">{profile?.fullName ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold uppercase text-xs tracking-wide">Meeting</span>
                  <span className="font-semibold text-right max-w-[55%] truncate">{participant?.meetingTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold uppercase text-xs tracking-wide">Signed At</span>
                  <span className="font-semibold">
                    {signedAt ? new Date(signedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }) : "—"}
                  </span>
                </div>
                {sigHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold uppercase text-xs tracking-wide">Fingerprint</span>
                    <span className="font-mono text-[10px] opacity-50">{sigHash.slice(0, 16)}…</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                A confirmation has been sent to your email.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 bg-muted/20 border-t py-4 rounded-b-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Enterprise Attendance
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
