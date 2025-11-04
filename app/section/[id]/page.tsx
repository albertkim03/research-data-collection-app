import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import FormSection from "@/components/form-section"
import { ChevronLeft } from "lucide-react"

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sectionNumber = Number.parseInt(id)

  if (![1, 2, 3].includes(sectionNumber)) {
    redirect("/sections")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: unlocks } = await supabase.from("passcode_unlocks").select("*").eq("user_id", user.id).single()

  const unlockField = `section_${sectionNumber}_unlocked`
  if (!unlocks || !unlocks[unlockField as keyof typeof unlocks]) {
    redirect("/sections")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">


      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-2">Research Section {sectionNumber}</h2>
        <p className="text-muted mb-8">Please answer all questions carefully and honestly</p>

        <FormSection sectionNumber={sectionNumber} userId={user.id} />
      </div>

    </main>
  )
}
