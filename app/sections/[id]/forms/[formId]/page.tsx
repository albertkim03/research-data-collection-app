import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import DynamicForm from "@/components/dynamic-form";

export const dynamic = "force-dynamic";

type Params = { id: string; formId: string };

export default async function FormPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, formId } = await params;     // <-- await the promise
  const sectionNumber = Number(id);
  if (Number.isNaN(sectionNumber)) notFound();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // must be unlocked
  const { data: pl } = await supabase
    .from("passcode_unlocks")
    .select("section_1_unlocked, section_2_unlocked, section_3_unlocked")
    .eq("user_id", user.id)
    .maybeSingle();

  const unlocked =
    (sectionNumber === 1 && pl?.section_1_unlocked) ||
    (sectionNumber === 2 && pl?.section_2_unlocked) ||
    (sectionNumber === 3 && pl?.section_3_unlocked);

  if (!unlocked) redirect(`/sections/${sectionNumber}`);

  // load form
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("section_number", sectionNumber)
    .single();

  if (!form) redirect(`/sections/${sectionNumber}`);

  // existing response (optional)
  const { data: existing } = await supabase
    .from("form_responses")
    .select("*")
    .eq("user_id", user.id)
    .eq("form_id", formId)
    .maybeSingle();

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        {form.description && <p className="text-muted">{form.description}</p>}
        <DynamicForm
          formId={form.id}
          sectionNumber={sectionNumber}
          userId={user.id}
          schema={form.form_schema}
          initialData={existing?.responses ?? null}
        />
      </div>
    </main>
  );
}
