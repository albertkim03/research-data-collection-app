"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Lock, LockOpen } from "lucide-react"

interface SectionUnlockStatus {
  section1: boolean
  section2: boolean
  section3: boolean
}

export default function Navbar() {
  const pathname = usePathname()
  const [unlockedSections, setUnlockedSections] = useState<SectionUnlockStatus>({
    section1: false,
    section2: false,
    section3: false,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchUnlockedSections = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase.from("user_section_access").select("section_id").eq("user_id", user.id)
        if (error || !data) return

        const { data: sections } = await supabase.from("sections").select("id, section_number")
        const sectionMap = sections?.reduce(
          (acc, section) => {
            acc[section.id] = section.section_number
            return acc
          },
          {} as Record<string, number>,
        )

        const unlocked = { section1: false, section2: false, section3: false }
        data.forEach((access) => {
          const num = sectionMap?.[access.section_id]
          if (num === 1) unlocked.section1 = true
          if (num === 2) unlocked.section2 = true
          if (num === 3) unlocked.section3 = true
        })
        setUnlockedSections(unlocked)
      } catch (error) {
        console.error("Error fetching unlocked sections:", error)
      }
    }
    fetchUnlockedSections()
  }, [supabase])

  const navItems = [
    { name: "Home", href: "/", unlocked: true },
    { name: "Section 1", href: "/sections/1", unlocked: unlockedSections.section1 },
    { name: "Section 2", href: "/sections/2", unlocked: unlockedSections.section2 },
    { name: "Section 3", href: "/sections/3", unlocked: unlockedSections.section3 },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="border-b border-border bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-primary">
          Research Study
        </Link>
        <div className="flex gap-2 items-center flex-wrap">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const isSection = item.href !== "/"
            const isLocked = isSection && !item.unlocked
            return (
              <Link key={item.href} href={item.href} className="inline-block">
                <Button
                  variant={active ? "default" : "outline"}
                  className={`gap-2 ${isLocked ? "opacity-60 cursor-not-allowed pointer-events-none" : ""} ${
                    active ? "bg-primary text-white" : ""
                  }`}
                  disabled={isLocked}
                >
                  {isSection && (isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />)}
                  {item.name}
                </Button>
              </Link>
            )
          })}
          <Link href="/auth/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
