// app/api/forms/[formId]/submit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const { sectionNumber, responses, pdfBase64 } = await req.json();

  const sectionNum = Number(sectionNumber);
  if (!formId || Number.isNaN(sectionNum)) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Validate form
  const { data: form, error: formErr } = await supabase
    .from("forms")
    .select("id, title, section_number, is_active")
    .eq("id", formId)
    .single();

  if (formErr || !form || !form.is_active || form.section_number !== sectionNum) {
    return NextResponse.json({ error: "Invalid form" }, { status: 404 });
  }

  // Save response
  const { error: upErr } = await supabase.from("form_responses").upsert(
    {
      user_id: user.id,
      form_id: formId,
      section_number: sectionNum,
      responses,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,form_id" }
  );
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Email via Resend
  try {
    const resend = new Resend(process.env.RESEND_KEY);

    const pretty = `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;white-space:pre-wrap;">${escapeHtml(
      JSON.stringify(responses, null, 2)
    )}</pre>`;

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
        <h2 style="margin:0 0 8px">New form submission</h2>
        <p style="margin:0 0 12px">
          <strong>Form:</strong> ${escapeHtml(form.title)}<br/>
          <strong>Section:</strong> ${sectionNum}<br/>
          <strong>User:</strong> ${escapeHtml(user.email ?? user.id)}
        </p>
        <p style="margin:0 0 6px">Responses:</p>
        ${pretty}
      </div>
    `;

    const attachments =
      typeof pdfBase64 === "string" && pdfBase64.length > 0
        ? [
            {
              filename: `submission-${sectionNum}-${formId}.pdf`,
              content: Buffer.from(pdfBase64, "base64"),
            },
          ]
        : undefined;

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      subject: `New submission: ${form.title} (Section ${sectionNum})`,
      html,
      attachments,
    });
  } catch (e: any) {
    // Do not fail the submission if email fails
    console.error("Resend error:", e?.message || e);
  }

  return NextResponse.json({ ok: true });
}

// Small helper to avoid breaking HTML
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
