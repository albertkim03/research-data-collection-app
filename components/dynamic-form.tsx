// components/dynamic-form.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmSubmit from "@/components/confirm-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------- Field types ----------
type TextField = {
  key: string;
  type: "text";
  label: string;
  required?: boolean;
  help?: string;
};

type RadioField = {
  key: string;
  type: "radio";
  label: string;
  options: string[];
  required?: boolean;
  help?: string;
};

type ScaleField = {
  key: string;
  type: "scale";
  label: string;
  min: number;
  max: number;
  step?: number;         // e.g. 5 to create 21 ticks for 0..100
  required?: boolean;
  help?: string;
  leftLabel?: string;    // e.g. "Very Low"
  rightLabel?: string;   // e.g. "Very High"
};

// Multiple-choice with optional prompt audio and per-option audio
type McqOption = { value: string; label: string; audio?: string };
type McqField = {
  key: string;
  type: "mcq";
  label: string;        // question text (EN or instruction)
  promptAudio?: string; // audio for the question stem
  options: McqOption[]; // without “I’m not sure”
  notSure?: boolean;    // if true, adds an “I’m not sure” choice
  required?: boolean;
  help?: string;
};

type Field = TextField | RadioField | ScaleField | McqField;

// ---------- Component ----------
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

  // ---------- Completion detection ----------
  const missingKeys = useMemo(() => {
    const misses: string[] = [];
    for (const f of schema.fields) {
      const v = data[f.key];
      if (f.type === "text") {
        if (typeof v !== "string" || v.trim().length === 0) misses.push(f.key);
      } else if (f.type === "radio") {
        const rf = f as RadioField;
        if (typeof v !== "string" || !rf.options.includes(v)) misses.push(f.key);
      } else if (f.type === "scale") {
        const sf = f as ScaleField;
        if (!touched[f.key]) misses.push(f.key);
        else if (typeof v !== "number" || v < sf.min || v > sf.max) misses.push(f.key);
      } else if (f.type === "mcq") {
        if (typeof v !== "string" || v.length === 0) misses.push(f.key);
      }
    }
    return misses;
  }, [schema.fields, data, touched]);

  const labelByKey = useMemo(() => {
    const m: Record<string, string> = {};
    schema.fields.forEach((f) => {
      m[f.key] = f.label;
    });
    return m;
  }, [schema.fields]);

  const isComplete = missingKeys.length === 0;

  // ---------- Submit ----------
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

  const showTopNotice =
    !isComplete && (attemptedSubmit || Object.keys(touched).length > 0);

  // small inline audio control for MCQ prompt/options
  const AudioInline = ({ src }: { src: string }) => (
    <audio controls src={src} className="h-8 align-middle">
      Your browser does not support the audio element.
    </audio>
  );

  // ---------- Render ----------
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
        const shouldShowFieldError =
          isMissing && (touched[f.key] || attemptedSubmit);
        const invalidClass = shouldShowFieldError ? "ring-1 ring-red-500" : "";
        const helpId = `${f.key}-help`;

        // ----- TEXT -----
        if (f.type === "text") {
          const tf = f as TextField;
          const val = typeof data[tf.key] === "string" ? data[tf.key] : "";
          return (
            <div key={tf.key} className="grid gap-2">
              <Label htmlFor={tf.key}>{tf.label}</Label>
              {tf.help && (
                <p id={helpId} className="text-xs text-muted">
                  {tf.help}
                </p>
              )}
              <Input
                id={tf.key}
                value={val}
                onChange={(e) => update(tf.key, e.target.value)}
                onBlur={() => markTouched(tf.key)}
                aria-invalid={shouldShowFieldError || undefined}
                aria-describedby={tf.help ? helpId : undefined}
                className={invalidClass}
                disabled={disabled}
              />
              {shouldShowFieldError && (
                <p className="text-xs text-red-600">Please enter a response.</p>
              )}
            </div>
          );
        }

        // ----- RADIO -----
        if (f.type === "radio") {
          const rf = f as RadioField;
          const val = data[rf.key];
          return (
            <fieldset key={rf.key} className="grid gap-2">
              <legend className="text-sm font-medium">{rf.label}</legend>
              {rf.help && (
                <p id={helpId} className="text-xs text-muted">
                  {rf.help}
                </p>
              )}
              <div className={`flex flex-wrap gap-3 rounded-md p-2 ${invalidClass}`}>
                {rf.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={rf.key}
                      value={opt}
                      checked={val === opt}
                      onChange={() => update(rf.key, opt)}
                      onBlur={() => markTouched(rf.key)}
                      aria-invalid={shouldShowFieldError || undefined}
                      aria-describedby={rf.help ? helpId : undefined}
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

        // ----- SCALE (NASA-TLX style) -----
        if (f.type === "scale") {
          const sf = f as ScaleField;
          const step =
            typeof sf.step === "number" && sf.step > 0 ? sf.step : 1;
          const val =
            typeof data[sf.key] === "number" ? data[sf.key] : sf.min; // doesn’t count until touched
          const hasPicked = touched[sf.key] && typeof data[sf.key] === "number";
          const listId = `${sf.key}-ticks`;

          // produce tick values (e.g., 0..100 step 5 => 21 ticks)
          const ticks: number[] = [];
          for (let i = sf.min; i <= sf.max; i += step) ticks.push(i);

          return (
            <div key={sf.key} className="grid gap-2">
              <span className="text-sm font-medium">{sf.label}</span>
              {sf.help && (
                <p id={helpId} className="text-xs text-muted">
                  {sf.help}
                </p>
              )}

              <input
                type="range"
                min={sf.min}
                max={sf.max}
                step={step}
                value={val}
                list={listId}
                onChange={(e) => update(sf.key, Number(e.target.value))}
                onMouseUp={() => markTouched(sf.key)}
                onTouchEnd={() => markTouched(sf.key)}
                aria-invalid={shouldShowFieldError || undefined}
                aria-describedby={sf.help ? helpId : undefined}
                className={`h-2 w-full rounded ${invalidClass}`}
                disabled={disabled}
              />

              <datalist id={listId}>
                {ticks.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              <div className="flex justify-between text-[11px] text-muted -mt-1">
                <span>{sf.leftLabel ?? "Very Low"}</span>
                <span>{hasPicked ? `Selected: ${val}` : "—"}</span>
                <span>{sf.rightLabel ?? "Very High"}</span>
              </div>

              {shouldShowFieldError && (
                <p className="text-xs text-red-600">Please choose a value.</p>
              )}
            </div>
          );
        }

        // ----- MCQ (with audio) -----
        if (f.type === "mcq") {
          const mf = f as McqField;
          const val = data[mf.key];

          const choices: McqOption[] = mf.notSure
            ? [...mf.options, { value: "unsure", label: "I’m not sure" }]
            : mf.options;

          return (
            <fieldset key={mf.key} className="grid gap-2">
              <legend className="text-sm font-medium">{mf.label}</legend>
              {mf.help && (
                <p id={helpId} className="text-xs text-muted">
                  {mf.help}
                </p>
              )}

              {mf.promptAudio && (
                <div className="mt-1">
                  <AudioInline src={mf.promptAudio} />
                </div>
              )}

              <div className={`mt-2 space-y-3 rounded-md p-2 ${invalidClass}`}>
                {choices.map((opt) => (
                  <div
                    key={opt.value}
                    className="flex items-center justify-between gap-3"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={mf.key}
                        value={opt.value}
                        checked={val === opt.value}
                        onChange={() => update(mf.key, opt.value)}
                        onBlur={() => markTouched(mf.key)}
                        aria-invalid={shouldShowFieldError || undefined}
                        aria-describedby={mf.help ? helpId : undefined}
                        disabled={disabled}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                    {opt.audio && <AudioInline src={opt.audio} />}
                  </div>
                ))}
              </div>

              {shouldShowFieldError && (
                <p className="text-xs text-red-600">Please select one option.</p>
              )}
            </fieldset>
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
