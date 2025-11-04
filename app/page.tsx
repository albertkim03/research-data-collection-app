"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Lock, LockOpen } from "lucide-react"

// ---------- Section Unlock Logic ----------
interface SectionUnlockStatus {
  section1: boolean
  section2: boolean
  section3: boolean
}

// ---------- Main Home Page ----------
export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Welcome to Our Research Study</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              This study collects valuable data to advance our understanding of key research questions. Your
              participation is vital to this research endeavor.
            </p>
          </div>

          <div className="bg-white border border-border rounded-lg p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Study Overview</h3>
              <p className="text-muted">
                This research comprises three data collection sections. Each section contains carefully designed
                questions to gather specific information. You&apos;ll need a passcode to unlock each section. Once
                unlocked, you can complete the forms at your own pace.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How It Works</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted">
                <li>Enter the passcode provided to unlock a research section</li>
                <li>Complete the form with honest and thoughtful responses</li>
                <li>Submit your responses to save your data</li>
                <li>Repeat for all three sections</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
