// app/api/forms/[formId]/submit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // resolve name + email once for both branches
  const { data: prof } = await supabase
    .from("profiles")
    .select("first_name,last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const fullName =
    [prof?.first_name, prof?.last_name].filter(Boolean).join(" ") ||
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "";

  const userEmail = user.email ?? "";
  const ct = req.headers.get("content-type") || "";

  async function getFormAndExisting(sectionNum: number) {
    const { data: form, error: formErr } = await supabase
      .from("forms")
      .select("id, title, section_number, is_active, kind, form_schema")
      .eq("id", formId)
      .single();

    if (formErr || !form || !form.is_active || form.section_number !== sectionNum) {
      return { error: NextResponse.json({ error: "Invalid form" }, { status: 404 }) as any };
    }

    const { data: existing } = await supabase
      .from("form_responses")
      .select("id, submitted")
      .eq("user_id", user.id)
      .eq("form_id", formId)
      .maybeSingle();

    return { form, existing };
  }

  // ---------- Branch 1: multipart/form-data (PDF uploads) ----------
  if (ct.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("pdf");
    const sectionNumberRaw = formData.get("sectionNumber");
    const sectionNum = Number(sectionNumberRaw);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }
    if (!formId || Number.isNaN(sectionNum)) {
      return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }
    const lower = (file.name || "").toLowerCase();
    const mime = file.type || "";
    if (!(mime === "application/pdf" || lower.endsWith(".pdf"))) {
      return NextResponse.json({ error: "Only PDFs are accepted" }, { status: 415 });
    }

    const { form, existing, error } = await getFormAndExisting(sectionNum);
    if (error) return error;
    if (form!.kind !== "pdf") {
      return NextResponse.json({ error: "This form is not a PDF upload" }, { status: 400 });
    }
    if (existing?.submitted) {
      return NextResponse.json({ error: "Already submitted" }, { status: 409 });
    }

    // email attachment via Resend
    try {
      const buf = Buffer.from(await (file as File).arrayBuffer());
      const RESEND_KEY = process.env.RESEND_KEY || process.env.RESEND_API_KEY;
      const EMAIL_TO = process.env.EMAIL_TO!;
      const EMAIL_FROM = process.env.EMAIL_FROM!;
      if (!RESEND_KEY || !EMAIL_TO || !EMAIL_FROM) {
        console.error("Missing RESEND_KEY/EMAIL_TO/EMAIL_FROM");
      } else {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: [EMAIL_TO],
            subject: `PDF submission: ${form!.title} (Section ${sectionNum})`,
            html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
                     <p>
                       <strong>Name:</strong> ${escapeHtml(fullName || "(not provided)")}<br/>
                       <strong>Email:</strong> ${escapeHtml(userEmail || "(unknown)")}
                     </p>
                     <p style="margin:0 0 10px">
                       <strong>Form:</strong> ${escapeHtml(form!.title)}<br/>
                       <strong>Section:</strong> ${sectionNum}<br/>
                       <strong>Form ID:</strong> ${escapeHtml(form!.id)}
                     </p>
                     <p>${escapeHtml(userEmail || user.id)} submitted a PDF for the form above.</p>
                   </div>`,
            attachments: [
              {
                filename: (file as File).name || `submission-${sectionNum}-${formId}.pdf`,
                content: buf.toString("base64"),
              },
            ],
          }),
        });
      }
    } catch (e) {
      console.error("Resend (pdf) error:", e);
    }

    // mark submitted
    const nowIso = new Date().toISOString();
    if (existing) {
      const { error: upErr } = await supabase
        .from("form_responses")
        .update({ submitted: true, submitted_at: nowIso })
        .eq("id", existing.id);
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    } else {
      const { error: insErr } = await supabase
        .from("form_responses")
        .insert({
          user_id: user.id,
          form_id: formId,
          section_number: sectionNum,
          submitted: true,
          submitted_at: nowIso,
        });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // ---------- Branch 2: application/json (digitised forms) ----------
  if (ct.includes("application/json")) {
    const { sectionNumber, responses } = await req.json();
    const sectionNum = Number(sectionNumber);
    if (!formId || Number.isNaN(sectionNum)) {
      return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }

    const { form, existing, error } = await getFormAndExisting(sectionNum);
    if (error) return error;
    if (form!.kind !== "digital") {
      return NextResponse.json({ error: "This form expects a PDF upload" }, { status: 400 });
    }
    if (existing?.submitted) {
      return NextResponse.json({ error: "Already submitted" }, { status: 409 });
    }

    // --- Optional grading if the form schema contains an answerKey map ---
    // Expected shape in forms.form_schema:
    // { version: 1, fields: [...], answerKey: { q1: "B", q2: "C", ... } }
    const schema: any = form!.form_schema || {};
    const answerKey: Record<string, string> | undefined = schema.answerKey;

    let scoreHtml = "";
    if (answerKey && typeof answerKey === "object") {
      const rows: string[] = [];
      let correctCount = 0;
      let total = 0;

      // only grade keys that exist in the answerKey
      for (const [qKey, correctValRaw] of Object.entries(answerKey)) {
        total += 1;
        const submitted = normalize(responses?.[qKey]);
        const correct = normalize(correctValRaw);
        const ok = submitted === correct;
        if (ok) correctCount += 1;
        rows.push(
          `<tr>
             <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(qKey)}</td>
             <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(
               correctValRaw as string
             )}</td>
             <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(
               responses?.[qKey] ?? "(blank)"
             )}</td>
             <td style="padding:6px 8px;border-bottom:1px solid #eee;">${
               ok ? "✅" : "❌"
             }</td>
           </tr>`
        );
      }

      const percent =
        total > 0 ? Math.round((correctCount / total) * 100) : 0;

      scoreHtml = `
        <div style="margin:14px 0">
          <div style="font-weight:600;margin-bottom:6px">
            Score: ${correctCount}/${total} (${percent}%)
          </div>
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;">Question</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;">Correct</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;">Submitted</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;">Result</th>
              </tr>
            </thead>
            <tbody>${rows.join("")}</tbody>
          </table>
        </div>`;
    }

    // email pretty JSON via Resend (no DB storage of responses)
    try {
      const RESEND_KEY = process.env.RESEND_KEY || process.env.RESEND_API_KEY;
      const EMAIL_TO = process.env.EMAIL_TO!;
      const EMAIL_FROM = process.env.EMAIL_FROM!;
      if (!RESEND_KEY || !EMAIL_TO || !EMAIL_FROM) {
        console.error("Missing RESEND_KEY/EMAIL_TO/EMAIL_FROM");
      } else {
        const pretty = `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(
          JSON.stringify(responses, null, 2)
        )}</pre>`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: [EMAIL_TO],
            subject: `New submission: ${form!.title} (Section ${sectionNum})`,
            html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
                     <p>
                       <strong>Name:</strong> ${escapeHtml(fullName || "(not provided)")}<br/>
                       <strong>Email:</strong> ${escapeHtml(userEmail || "(unknown)")}
                     </p>
                     <p style="margin:0 0 10px">
                       <strong>Form:</strong> ${escapeHtml(form!.title)}<br/>
                       <strong>Section:</strong> ${sectionNum}<br/>
                       <strong>Form ID:</strong> ${escapeHtml(form!.id)}
                     </p>
                     ${scoreHtml}
                     <p style="margin:10px 0 6px">Raw responses:</p>
                     ${pretty}
                   </div>`,
          }),
        });
      }
    } catch (e) {
      console.error("Resend (digital) error:", e);
    }

    // mark submitted only
    const nowIso = new Date().toISOString();
    if (existing) {
      const { error: upErr } = await supabase
        .from("form_responses")
        .update({ submitted: true, submitted_at: nowIso })
        .eq("id", existing.id);
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    } else {
      const { error: insErr } = await supabase
        .from("form_responses")
        .insert({
          user_id: user.id,
          form_id: formId,
          section_number: sectionNum,
          submitted: true,
          submitted_at: nowIso,
        });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // Unsupported Content-Type
  return NextResponse.json(
    { error: 'Unsupported Content-Type (use "application/json" or "multipart/form-data")' },
    { status: 415 }
  );
}

function normalize(v: any): string {
  return String(v ?? "").trim().toLowerCase();
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
