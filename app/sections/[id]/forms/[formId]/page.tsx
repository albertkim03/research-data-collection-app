// app/sections/[id]/forms/[formId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DynamicForm from "@/components/dynamic-form";
import PdfUploadForm from "@/components/pdf-upload-form";

export default async function FormPage({
  params,
}: {
  params: { id: string; formId: string } | Promise<{ id: string; formId: string }>;
}) {
  const { id, formId } = await Promise.resolve(params);
  const sectionNumber = Number(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // must be unlocked
  const { data: pl } = await supabase
    .from("passcode_unlocks")
    .select("section_1_unlocked, section_2_unlocked, section_3_unlocked")
    .eq("user_id", user.id)
    .single();

  const canView =
    (sectionNumber === 1 && pl?.section_1_unlocked) ||
    (sectionNumber === 2 && pl?.section_2_unlocked) ||
    (sectionNumber === 3 && pl?.section_3_unlocked);
  if (!canView) redirect(`/sections/${sectionNumber}`);

  // load form
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("section_number", sectionNumber)
    .single();

  // check existing submission
  const { data: existing } = await supabase
    .from("form_responses")
    .select("submitted_at, submitted")
    .eq("user_id", user.id)
    .eq("form_id", formId)
    .maybeSingle();

  const locked = !!existing?.submitted;

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        {locked && (
          <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm">
            You have already submitted this form on {existing?.submitted_at?.slice(0, 10)}.
          </div>
        )}

        {form.kind === "pdf" ? (
          <PdfUploadForm
            formId={form.id}
            sectionNumber={sectionNumber}
            pdfPath={`/pdfs/${form.pdf_path}`}
            locked={locked}
          />
        ) : (
          <DynamicForm
            formId={form.id}
            sectionNumber={sectionNumber}
            schema={form.form_schema}
            initialData={null}
            locked={locked}
          />
        )}
      </div>
    </main>
  );
}
