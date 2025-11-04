import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b border-border bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Research Study</h1>
          <Link href="/auth/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </nav>

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

          <div className="text-center">
            <Link href="/sections">
              <Button size="lg" className="bg-primary hover:bg-primary-light">
                Go to Sections
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-16 border-t border-border bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted">
          <p className="mb-2">UNSW Research Study</p>
          <p>For questions or concerns, contact: research@unsw.edu.au</p>
        </div>
      </footer>
    </main>
  )
}
