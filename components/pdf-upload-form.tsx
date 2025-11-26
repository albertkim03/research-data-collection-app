// components/pdf-upload-form.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConfirmSubmit from "@/components/confirm-submit";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export default function PdfUploadForm({
  formId,
  sectionNumber,
  pdfPath,          // e.g. "/pdfs/pre-questionnaire.pdf"
  locked,
}: {
  formId: string;
  sectionNumber: number;
  pdfPath: string;
  locked?: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const disabled = !!locked || sending;

  // derive a nice title from the path (fallback to generic)
  const pdfTitle = useMemo(() => {
    try {
      const base = pdfPath.split("/").pop() || "Form.pdf";
      // strip extension and prettify dashes/underscores
      const name = base.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return "Form";
    }
  }, [pdfPath]);

  const validate = (f: File | null): string | null => {
    if (!f) return "Please choose a PDF to upload.";
    if (f.size === 0) return "The selected file is empty.";
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return "Only PDF files are accepted.";
    if (f.size > MAX_BYTES) return "File is larger than 15 MB.";
    return null;
  };

  const pickFile = () => inputRef.current?.click();

  const onFileChange = (f: File | null) => {
    const msg = validate(f);
    setError(msg);
    setFile(msg ? null : f);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    onFileChange(f);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  const doSubmit = async () => {
    setError(null);
    const msg = validate(file);
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("pdf", file!);
      formData.append("sectionNumber", String(sectionNumber));

      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        throw new Error(message);
      }

      router.replace(`/sections/${sectionNumber}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="space-y-6">
      {/* Enhanced “View / Download PDF” card */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
              <span aria-hidden className="text-2xl">📄</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold leading-tight">{pdfTitle}</h3>
                <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted">
                  PDF
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                Download the official form (with letterhead), complete it, then upload the filled PDF below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href={pdfPath} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </Button>
            <Button asChild>
              <a href={pdfPath} download>
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Pretty picker: clickable + drag & drop */}
      <div
        onClick={pickFile}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pickFile()}
        className={[
          "rounded-xl border-2 border-dashed bg-white p-6 cursor-pointer transition",
          dragOver ? "border-primary/60 bg-primary/5" : "border-gray-300 hover:border-gray-400",
          disabled ? "opacity-60 cursor-not-allowed" : ""
        ].join(" ")}
        aria-label="Upload PDF"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-2xl">📎</span>
          </div>
        <div className="flex-1">
            <div className="text-sm font-medium">
              {file ? "File selected" : "Click to choose a file or drag & drop a PDF"}
            </div>
            <div className="text-xs text-muted">
              PDF only, up to 15 MB. Your file will be emailed to the researcher and not stored in the database.
            </div>
            {file && (
              <div className="mt-1 text-sm">
                <span className="font-medium">{file.name}</span>{" "}
                <span className="text-muted">({Math.ceil(file.size / 1024)} KB)</span>
              </div>
            )}
          </div>
          <Button type="button" variant="outline" disabled={disabled}>
            Choose file
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <ConfirmSubmit onConfirm={doSubmit} disabled={disabled || !file} />
    </form>
  );
}
