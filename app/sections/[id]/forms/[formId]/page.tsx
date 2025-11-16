import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DynamicForm from "@/components/dynamic-form";

export default async function FormPage({ params }: { params: { id: string; formId: string } }) {
  const supabase = await createClient();
  const sectionNumber = Number(params.id);
  const formId = params.formId;

  if (Number.isNaN(sectionNumber)) redirect("/sections");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Must be unlocked
  const { data: pl } = await supabase
    .from("passcode_unlocks")
    .select("section_1_unlocked, section_2_unlocked, section_3_unlocked")
    .eq("user_id", user.id)
    .single();

  const unlocked =
    (sectionNumber === 1 && pl?.section_1_unlocked) ||
    (sectionNumber === 2 && pl?.section_2_unlocked) ||
    (sectionNumber === 3 && pl?.section_3_unlocked);

  if (!unlocked) redirect(`/sections/${sectionNumber}`);

  // Load form
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("section_number", sectionNumber)
    .single();

  if (!form) redirect(`/sections/${sectionNumber}`);

  // Existing response (optional)
  const { data: existing } = await supabase
    .from("form_responses")
    .select("*")
    .eq("user_id", user.id)
    .eq("form_id", formId)
    .single();

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
