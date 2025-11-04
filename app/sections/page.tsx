import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SectionCard from "@/components/section-card"

export default async function SectionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all sections
  const { data: sections, error } = await supabase
    .from("sections")
    .select("*")
    .order("section_number", { ascending: true })

  if (error) {
    console.error("Error fetching sections:", error)
  }

  // Fetch user's unlocked sections
  const { data: unlockedSections } = await supabase
    .from("user_section_access")
    .select("section_id")
    .eq("user_id", user.id)

  const unlockedSectionIds = new Set(unlockedSections?.map((s) => s.section_id) || [])

  const completionStats = {
    total: sections?.length || 0,
    unlocked: unlockedSectionIds.size,
    completionPercentage: Math.round(((unlockedSectionIds.size || 0) / (sections?.length || 1)) * 100),
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">


      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link href="/">
            <Button variant="ghost" className="mb-6 transition-all hover:translate-x-1">
              ← Back to Home
            </Button>
          </Link>
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Research Sections</h2>
              <p className="text-muted leading-relaxed">
                Complete each section by entering the passcode and answering the questions. Your progress is
                automatically saved.
              </p>
            </div>

            <div className="bg-white border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Progress</span>
                <span className="text-sm text-muted">
                  {completionStats.unlocked} of {completionStats.total} unlocked
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${completionStats.completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-2">{completionStats.completionPercentage}% Complete</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {sections &&
            sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isUnlocked={unlockedSectionIds.has(section.id)}
                userId={user.id}
              />
            ))}
        </div>
      </div>
    </main>
  )
}
