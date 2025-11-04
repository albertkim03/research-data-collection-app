"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Passcodes for each section (in production, these should be securely managed)
const SECTION_PASSCODES: Record<number, string> = {
  1: "SECTION1",
  2: "SECTION2",
  3: "SECTION3",
}

interface PasscodeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  sectionNumber: number
}

export default function PasscodeDialog({ isOpen, onOpenChange, sectionNumber }: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (passcode.trim().toUpperCase() !== SECTION_PASSCODES[sectionNumber]) {
        setError("Invalid passcode. Please try again.")
        setIsLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Not authenticated")
        setIsLoading(false)
        return
      }

      const updateField = `section_${sectionNumber}_unlocked`
      const { error: updateError } = await supabase
        .from("passcode_unlocks")
        .update({ [updateField]: true })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      onOpenChange(false)
      router.push(`/section/${sectionNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Passcode</DialogTitle>
          <DialogDescription>
            Enter the passcode for Section {sectionNumber} to unlock this research section.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="text"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !passcode.trim()}
              className="bg-primary hover:bg-primary-light"
            >
              {isLoading ? "Checking..." : "Unlock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
