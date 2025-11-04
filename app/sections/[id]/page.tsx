import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import SectionForm from "@/components/section-form"

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the section details
  const { data: section, error: sectionError } = await supabase.from("sections").select("*").eq("id", id).single()

  if (sectionError || !section) {
    redirect("/sections")
  }

  // Check if user has access to this section
  const { data: access } = await supabase
    .from("user_section_access")
    .select("*")
    .eq("user_id", user.id)
    .eq("section_id", id)
    .single()

  if (!access) {
    redirect("/sections")
  }

  // Fetch existing response if any
  const { data: existingResponse } = await supabase
    .from("form_responses")
    .select("*")
    .eq("user_id", user.id)
    .eq("section_id", id)
    .single()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b border-border bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Research Study</h1>
            <p className="text-sm text-muted">{section.title}</p>
          </div>
          <Link href="/auth/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/sections" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Back to Sections
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{section.title}</h2>
            <p className="text-muted">{section.description}</p>
          </div>

          <SectionForm section={section} userId={user.id} initialData={existingResponse?.response_data || null} />
        </Card>
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
