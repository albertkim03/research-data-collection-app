"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UnlockForm({
  sectionNumber,
  onUnlocked,
}: {
  sectionNumber: number;
  onUnlocked?: () => void;
}) {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("Please log in to unlock this section.");
      setLoading(false);
      return;
    }

    const { data: section, error: secErr } = await supabase
      .from("sections")
      .select("passcode")
      .eq("section_number", sectionNumber)
      .single();

    if (secErr || !section) {
      setErr("Could not load this section. Try again.");
      setLoading(false);
      return;
    }

    if (code.trim() !== section.passcode) {
      setErr("Incorrect passcode.");
      setLoading(false);
      return;
    }

    // mark unlocked for this user
    const patch: any = { user_id: user.id };
    if (sectionNumber === 1) patch.section_1_unlocked = true;
    if (sectionNumber === 2) patch.section_2_unlocked = true;
    if (sectionNumber === 3) patch.section_3_unlocked = true;

    const { error: upErr } = await supabase
      .from("passcode_unlocks")
      .upsert(patch, { onConflict: "user_id" });

    if (upErr) {
      setErr(upErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onUnlocked?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3 max-w-sm">
      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Enter passcode for Section {sectionNumber}
        </label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter passcode"
          required
        />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Unlocking..." : "Unlock"}
      </Button>
    </form>
  );
}
