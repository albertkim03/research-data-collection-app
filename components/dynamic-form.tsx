// components/dynamic-form.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmSubmit from "@/components/confirm-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field =
  | { key: string; type: "text";  label: string; required?: boolean; help?: string }
  | { key: string; type: "radio"; label: string; options: string[]; required?: boolean; help?: string }
  | {
      key: string;
      type: "scale";
      label: string;
      min: number;
      max: number;
      step?: number;
      required?: boolean;
      help?: string;
      leftLabel?: string;
      rightLabel?: string;
    };

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

  // Start from any previously saved values; nothing is auto-picked.
  const [data, setData] = useState<Record<string, any>>(initialData ?? {});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !!locked || saving;

  const markTouched = (k: string) =>
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const update = (k: string, v: any) => {
    setData((d) => ({ ...d, [k]: v }));
    markTouched(k);
  };

  // Missing keys for inline guidance
  const missingKeys = useMemo(() => {
    const misses: string[] = [];
    for (const f of schema.fields) {
      const v = data[f.key];
      if (f.type === "text") {
        if (typeof v !== "string" || v.trim().length === 0) misses.push(f.key);
      } else if (f.type === "radio") {
        if (typeof v !== "string" || !f.options.includes(v)) misses.push(f.key);
      } else if (f.type === "scale") {
        if (!touched[f.key]) misses.push(f.key);
        else if (typeof v !== "number" || v < f.min || v > f.max) misses.push(f.key);
      }
    }
    return misses;
  }, [schema.fields, data, touched]);

  const labelByKey = useMemo(() => {
    const m: Record<string, string> = {};
    schema.fields.forEach((f) => { m[f.key] = f.label; });
    return m;
  }, [schema.fields]);

  const isComplete = missingKeys.length === 0;

  const submit = async () => {
    setAttemptedSubmit(true);
    setError(null);
    if (!isComplete) {
      setError("Please complete all questions before submitting.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionNumber: Number(sectionNumber),
          responses: data,
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
      router.replace(`/sections/${sectionNumber}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  const showTopNotice = !isComplete && (attemptedSubmit || Object.keys(touched).length > 0);

  return (
    <form className="space-y-6">
      {showTopNotice && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          <div className="font-medium mb-1">You need to finish all questions.</div>
          <div>
            Remaining:{" "}
            <span className="italic">
              {missingKeys.map((k) => labelByKey[k]).join(", ")}
            </span>
          </div>
        </div>
      )}

      {schema.fields.map((f) => {
        const isMissing = missingKeys.includes(f.key);
        const shouldShowFieldError = isMissing && (touched[f.key] || attemptedSubmit);
        const invalidClass = shouldShowFieldError ? "ring-1 ring-red-500" : "";
        const helpId = `${f.key}-help`;

        if (f.type === "text") {
          const val = typeof data[f.key] === "string" ? data[f.key] : "";
          return (
            <div key={f.key} className="grid gap-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.help && <p id={helpId} className="text-xs text-muted">{f.help}</p>}
              <Input
                id={f.key}
                value={val}
                onChange={(e) => update(f.key, e.target.value)}
                onBlur={() => markTouched(f.key)}
                aria-invalid={shouldShowFieldError || undefined}
                aria-describedby={f.help ? helpId : undefined}
                className={invalidClass}
                disabled={disabled}
              />
              {shouldShowFieldError && (
                <p className="text-xs text-red-600">Please enter a response.</p>
              )}
            </div>
          );
        }

        if (f.type === "radio") {
          const val = data[f.key];
          return (
            <fieldset key={f.key} className="grid gap-2">
              <legend className="text-sm font-medium">{f.label}</legend>
              {f.help && <p id={helpId} className="text-xs text-muted">{f.help}</p>}
              <div className={`flex flex-wrap gap-3 rounded-md p-2 ${invalidClass}`}>
                {f.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={f.key}
                      value={opt}
                      checked={val === opt}
                      onChange={() => update(f.key, opt)}
                      onBlur={() => markTouched(f.key)}
                      aria-invalid={shouldShowFieldError || undefined}
                      aria-describedby={f.help ? helpId : undefined}
                      disabled={disabled}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
              {shouldShowFieldError && (
                <p className="text-xs text-red-600">Please choose an option.</p>
              )}
            </fieldset>
          );
        }

        if (f.type === "scale") {
          const step = typeof f.step === "number" && f.step > 0 ? f.step : 1;
          const val = typeof data[f.key] === "number" ? data[f.key] : f.min; // render at min, but doesn’t count until touched
          const hasPicked = touched[f.key] && typeof data[f.key] === "number";
          const listId = `${f.key}-ticks`;

          const ticks: number[] = [];
          for (let i = f.min; i <= f.max; i += step) ticks.push(i);

          return (
            <div key={f.key} className="grid gap-2">
              <span className="text-sm font-medium">{f.label}</span>
              {f.help && <p id={helpId} className="text-xs text-muted">{f.help}</p>

              }
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={step}
                value={val}
                list={listId}
                onChange={(e) => update(f.key, Number(e.target.value))}
                onMouseUp={() => markTouched(f.key)}
                onTouchEnd={() => markTouched(f.key)}
                aria-invalid={shouldShowFieldError || undefined}
                aria-describedby={f.help ? helpId : undefined}
                className={`h-2 w-full rounded ${invalidClass}`}
                disabled={disabled}
              />

              {/* 21 tick marks to mirror the PDF */}
              <datalist id={listId}>
                {ticks.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              {/* Anchor labels visually on the slider line */}
              <div className="flex justify-between text-[11px] text-muted -mt-1">
                <span>{f.leftLabel ?? "Low"}</span>
                <span>{hasPicked ? `Selected: ${val}` : "—"}</span>
                <span>{f.rightLabel ?? "High"}</span>
              </div>

              {shouldShowFieldError && (
                <p className="text-xs text-red-600">Please choose a value.</p>
              )}
            </div>
          );
        }

        return null;
      })}

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex items-center gap-3">
        <ConfirmSubmit onConfirm={submit} disabled={disabled || !isComplete} />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setData({});
            setTouched({});
            setAttemptedSubmit(false);
          }}
          disabled={disabled}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
