// components/dynamic-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmSubmit from "@/components/confirm-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field =
  | { key: string; type: "text"; label: string; required?: boolean }
  | { key: string; type: "radio"; label: string; options: string[]; required?: boolean }
  | { key: string; type: "scale"; label: string; min: number; max: number; required?: boolean };

export default function DynamicForm({
  formId,
  sectionNumber,
  schema,
  initialData,
  locked,
}: {
  formId: string;
  sectionNumber: number;
  schema: { version: number; fields: Field[] };
  initialData?: Record<string, any> | null;
  locked?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any>>(initialData ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !!locked || saving;

  const update = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionNumber: Number(sectionNumber),
          responses: data,
          // pdfBase64: "<optional if you generate a pdf client-side>"
        }),
      });

      if (!res.ok) {
        let msg = `Submit failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      // success
      router.replace(`/sections/${sectionNumber}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6">
      {schema.fields.map((f) => {
        if (f.type === "text") {
          return (
            <div key={f.key} className="grid gap-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                value={data[f.key] ?? ""}
                onChange={(e) => update(f.key, e.target.value)}
                required={!!f.required}
                disabled={disabled}
              />
            </div>
          );
        }

        if (f.type === "radio") {
          return (
            <fieldset key={f.key} className="grid gap-2">
              <legend className="text-sm font-medium">{f.label}</legend>
              <div className="flex flex-wrap gap-3">
                {f.options.map((opt, idx) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={f.key}
                      value={opt}
                      checked={data[f.key] === opt}
                      onChange={() => update(f.key, opt)}
                      required={!!f.required && idx === 0}
                      disabled={disabled}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }

        if (f.type === "scale") {
          const val = data[f.key] ?? Math.round((f.min + f.max) / 2);
          return (
            <div key={f.key} className="grid gap-2">
              <span className="text-sm font-medium">
                {f.label} ({f.min}–{f.max})
              </span>
              <input
                type="range"
                min={f.min}
                max={f.max}
                value={val}
                onChange={(e) => update(f.key, Number(e.target.value))}
                disabled={disabled}
              />
              <div className="text-xs text-muted">Selected: {val}</div>
            </div>
          );
        }

        return null;
      })}

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex items-center gap-3">
        <ConfirmSubmit onConfirm={submit} disabled={disabled} />
        <Button
          type="button"
          variant="outline"
          onClick={() => setData({})}
          disabled={disabled}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
