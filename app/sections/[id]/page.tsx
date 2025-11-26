// app/sections/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UnlockForm from "@/components/unlock-form";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PageProps = { params: { id: string } };

// match your DB: digital/pdf + optional pdf_path
type FormRow = {
  id: string;
  title: string;
  description: string | null;
  position: number | null;
  kind?: "digital" | "pdf";
  pdf_path?: string | null;
};

export default async function SectionDetail({ params }: PageProps) {
  const { id } = await params;
  if (!["1", "2", "3"].includes(id)) notFound();
  const sectionNumber = Number(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("section_number", sectionNumber)
    .single();

  const { data: pu } = await supabase
    .from("passcode_unlocks")
    .select("section_1_unlocked, section_2_unlocked, section_3_unlocked")
    .eq("user_id", user.id)
    .maybeSingle();

  const unlocked =
    (sectionNumber === 1 && pu?.section_1_unlocked) ||
    (sectionNumber === 2 && pu?.section_2_unlocked) ||
    (sectionNumber === 3 && pu?.section_3_unlocked);

  // ⬇️ include kind (and pdf_path if you want to show a hint/link)
  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, description, position, kind, pdf_path")
    .eq("section_number", sectionNumber)
    .eq("is_active", true)
    .order("position", { ascending: true }) as unknown as { data: FormRow[] };

  // completion state
  const { data: submittedRows } = await supabase
    .from("form_responses")
    .select("form_id, submitted")
    .eq("user_id", user.id)
    .eq("section_number", sectionNumber);

  const submittedSet = new Set(
    (submittedRows ?? []).filter(r => r.submitted).map(r => r.form_id)
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{section?.title ?? `Section ${sectionNumber}`}</h1>
            {section?.description && <p className="text-muted">{section.description}</p>}
          </div>
          <Link href="/"><Button variant="ghost">← Home</Button></Link>
        </div>

        {!unlocked ? (
          <div className="rounded-lg border border-border bg-white p-6">
            <p className="mb-4 text-sm text-muted">This section is locked. Enter the passcode to continue.</p>
            <UnlockForm sectionNumber={sectionNumber} />
          </div>
        ) : (
          <div className="grid gap-4">
            {(forms ?? []).map((f) => {
              const done = submittedSet.has(f.id);
              const isPdf = f.kind === "pdf";
              return (
                <div key={f.id} className="border rounded-md p-4 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    {f.description && <p className="text-sm text-muted">{f.description}</p>}
                    {done && <p className="mt-1 text-xs text-green-700">Submitted</p>}
                    {isPdf && <p className="mt-1 text-xs text-muted">PDF upload</p>}
                  </div>
                  <Link href={`/sections/${sectionNumber}/forms/${f.id}`}>
                    <Button disabled={done}>Open</Button>
                  </Link>
                </div>
              );
            })}
            {(!forms || forms.length === 0) && (
              <p className="text-sm text-muted">No forms are available yet for this section.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
