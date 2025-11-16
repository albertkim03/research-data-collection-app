// components/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen } from "lucide-react";

type Unlocks = { section1: boolean; section2: boolean; section3: boolean };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [unlocks, setUnlocks] = useState<Unlocks>({
    section1: false,
    section2: false,
    section3: false,
  });

  useEffect(() => {
    let mounted = true;

    const fetchUnlocks = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setIsAuthed(false);
        setUnlocks({ section1: false, section2: false, section3: false });
        setLoading(false);
        return;
      }
      setIsAuthed(true);

      // Ensure a row exists so .single() doesn’t 404
      await supabase.from("passcode_unlocks").upsert(
        { user_id: user.id }, // defaults (all false) will be used
        { onConflict: "user_id" }
      );

      const { data, error } = await supabase
        .from("passcode_unlocks")
        .select("section_1_unlocked, section_2_unlocked, section_3_unlocked")
        .eq("user_id", user.id)
        .single();

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch passcode_unlocks:", error);
        setUnlocks({ section1: false, section2: false, section3: false });
      } else {
        setUnlocks({
          section1: !!data?.section_1_unlocked,
          section2: !!data?.section_2_unlocked,
          section3: !!data?.section_3_unlocked,
        });
      }
      setLoading(false);
    };

    fetchUnlocks();

    // Refresh locks when auth state changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      fetchUnlocks();
      if (event === "SIGNED_OUT" && pathname?.startsWith("/sections")) {
        router.replace("/");
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/", unlocked: true },
    { name: "Section 1", href: "/sections/1", unlocked: unlocks.section1 },
    { name: "Section 2", href: "/sections/2", unlocked: unlocks.section2 },
    { name: "Section 3", href: "/sections/3", unlocked: unlocks.section3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="border-b border-border bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-primary">
          Research Study
        </Link>

        <div className="flex gap-2 items-center flex-wrap">
          {isAuthed ? (navItems.map((item) => {
            const active = isActive(item.href);
            const isSection = item.href !== "/";
            const isLocked = isSection && !item.unlocked;

            return (
              <Link key={item.href} href={item.href} className="inline-block">
                <Button
                  variant={active ? "default" : "outline"}
                  className={`gap-2 ${active ? "bg-primary text-white" : ""}`}
                  aria-label={`${item.name}${isLocked ? " (locked)" : ""}`}
                >
                  {isSection &&
                    (isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />)}
                  {item.name}
                </Button>
              </Link>
            );
          })) : null}

          {!isAuthed ? (
            <>
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign up</Button>
              </Link>
            </>
          ) : (
            <Link href="/auth/logout">
              <Button variant="outline">{loading ? "…" : "Logout"}</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
