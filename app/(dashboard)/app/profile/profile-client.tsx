"use client"

import { useState, useRef } from "react"
import { UserProfile, staffApi } from "@/lib/api-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { SignatureCanvas } from "@/components/signature/signature-canvas"

interface Props {
  initialProfile: UserProfile
  userId: string
}

export function ProfileClient({ initialProfile, userId }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const [showSigModal, setShowSigModal] = useState(false)
  const [currentSig, setCurrentSig] = useState<string | null>(null)
  const canvasRef = useRef<any>(null)

  const handleSave = async () => {
    setLoading(true)
    try {
      await staffApi.updateMe(userId, profile)
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const applySignature = () => {
    if (!currentSig) {
      toast.error("Please draw your signature first")
      return
    }
    setProfile({ ...profile, signatureLibrary: [currentSig] })
    setShowSigModal(false)
    setCurrentSig(null)
    toast.success("Signature captured! Click 'Save Changes' to apply.")
  }

  const clearSignature = () => {
    setProfile({ ...profile, signatureLibrary: [] })
    toast.info("Signature cleared. Click 'Save Changes' to apply.")
  }

  return (
    <div className="space-y-6">
      <div className="s-card">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="s-mono-label">Full Name</label>
            <input 
              className="w-full p-2 border border-[var(--s-border2)] rounded-[var(--s-radius)]"
              value={profile.fullName} 
              onChange={e => setProfile({...profile, fullName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="s-mono-label">Employee ID</label>
            <input 
              className="w-full p-2 border border-[var(--s-border2)] rounded-[var(--s-radius)] font-mono text-sm"
              value={profile.staffId || ""} 
              readOnly
              style={{ background: "var(--s-surface2)", cursor: "not-allowed" }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="s-mono-label">Email</label>
            <input 
              className="w-full p-2 border border-[var(--s-border2)] rounded-[var(--s-radius)]"
              value={profile.email} 
              readOnly
              style={{ background: "var(--s-surface2)", cursor: "not-allowed" }}
            />
          </div>
          <div className="space-y-2">
            <label className="s-mono-label">Designation</label>
            <input 
              className="w-full p-2 border border-[var(--s-border2)] rounded-[var(--s-radius)]"
              value={profile.designation || ""} 
              onChange={e => setProfile({...profile, designation: e.target.value})}
            />
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--s-border)", margin: "24px 0" }} />

        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "14px" }}>Saved Signature</div>
        
        <div style={{
          border: "1.5px dashed var(--s-border2)",
          borderRadius: "var(--s-radius)",
          width: "100%",
          maxWidth: "400px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF8",
          overflow: "hidden",
          position: "relative"
        }}>
          {profile.signatureLibrary[0] ? (
            <img src={profile.signatureLibrary[0]} alt="Signature" style={{ maxHeight: "100px" }} />
          ) : (
            <div style={{ fontSize: "12px", color: "var(--s-text3)", fontFamily: "var(--s-mono)" }}>
              Draw your signature below
            </div>
          )}
        </div>

        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <button className="s-btn s-btn-primary s-btn-sm" onClick={() => setShowSigModal(true)}>
            {profile.signatureLibrary[0] ? "Update Signature" : "Draw Signature"}
          </button>
          {profile.signatureLibrary[0] && (
            <button className="s-btn s-btn-danger s-btn-sm" onClick={clearSignature}>Clear</button>
          )}
        </div>
        
        <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "12px" }}>
          Once saved, your signature is reused automatically across all meetings.
        </div>

        <div style={{ height: "1px", background: "var(--s-border)", margin: "24px 0" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button className="s-btn s-btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button className="s-btn s-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {showSigModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", 
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div className="s-card" style={{ width: "460px", maxWidth: "95vw" }}>
            <div style={{ fontSize: "17px", fontWeight: 600, marginBottom: "12px" }}>Draw Your Signature</div>
            <div style={{ fontSize: "13px", color: "var(--s-text2)", marginBottom: "20px" }}>
              Sign in the box below. This will be saved to your profile.
            </div>
            
            <SignatureCanvas 
              onSave={setCurrentSig} 
              onClear={() => setCurrentSig(null)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="s-btn s-btn-secondary" onClick={() => setShowSigModal(false)}>Cancel</button>
              <button className="s-btn s-btn-primary" onClick={applySignature}>Apply Signature</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
