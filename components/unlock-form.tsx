// components/unlock-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UnlockForm({ sectionNumber }: { sectionNumber: number }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    try {
      // who am I
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in.");
        return;
      }

      // verify passcode for this section
      const { data: section, error: secErr } = await supabase
        .from("sections")
        .select("passcode")
        .eq("section_number", sectionNumber)
        .single();
      if (secErr) throw secErr;

      if (code.trim() !== section?.passcode) {
        setError("Incorrect passcode.");
        return;
      }

      // mark unlocked
      const column =
        sectionNumber === 1 ? "section_1_unlocked" :
        sectionNumber === 2 ? "section_2_unlocked" : "section_3_unlocked";

      await supabase.from("passcode_unlocks").upsert(
        { user_id: user.id, [column]: true },
        { onConflict: "user_id" }
      );

      // 🔁 re-render the server route so it shows the unlocked UI
      router.refresh();                   // triggers a server re-render
      // (optional) also replace to the same URL to make it instant:
      router.replace(`/sections/${sectionNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter passcode"
          required
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Unlocking…" : "Unlock"}
      </Button>
    </form>
  );
}
