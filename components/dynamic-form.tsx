"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Field =
  | { type: "text"; name: string; label: string; required?: boolean; placeholder?: string }
  | { type: "textarea"; name: string; label: string; required?: boolean; placeholder?: string }
  | { type: "checkbox"; name: string; label: string; required?: boolean }
  | { type: "radio"; name: string; label: string; required?: boolean; options: { value: string; label: string }[] }

export default function DynamicForm({
  formId,
  sectionNumber,
  userId,
  schema,
  initialData,
}: {
  formId: string
  sectionNumber: number
  userId: string
  schema: { fields: Field[] }
  initialData: Record<string, any> | null
}) {
  const supabase = createClient()
  const [values, setValues] = useState<Record<string, any>>(initialData ?? {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onChange = (name: string, v: any) => setValues((s) => ({ ...s, [name]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    const { error } = await supabase
      .from("form_responses")
      .upsert(
        { user_id: userId, section_number: sectionNumber, form_id: formId, responses: values },
        { onConflict: "user_id,form_id" }
      )
    if (error) setError(error.message); else setSuccess(true)
    setSaving(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {schema?.fields?.map((f, i) => {
        switch (f.type) {
          case "text":
            return (
              <div key={i} className="grid gap-2">
                <Label>{f.label}</Label>
                <Input required={!!f.required} placeholder={f.placeholder} value={values[f.name] ?? ""}
                       onChange={(e) => onChange(f.name, e.target.value)} />
              </div>
            )
          case "textarea":
            return (
              <div key={i} className="grid gap-2">
                <Label>{f.label}</Label>
                <Textarea required={!!f.required} placeholder={f.placeholder} value={values[f.name] ?? ""}
                          onChange={(e) => onChange(f.name, e.target.value)} />
              </div>
            )
          case "checkbox":
            return (
              <div key={i} className="flex items-center gap-2">
                <Checkbox checked={!!values[f.name]} onCheckedChange={(v) => onChange(f.name, !!v)} />
                <Label>{f.label}</Label>
              </div>
            )
          case "radio":
            return (
              <div key={i} className="grid gap-2">
                <Label>{f.label}</Label>
                <RadioGroup value={values[f.name] ?? ""} onValueChange={(v) => onChange(f.name, v)}>
                  {f.options.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} id={`${f.name}-${opt.value}`} />
                      <Label htmlFor={`${f.name}-${opt.value}`}>{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )
          default:
            return null
        }
      })}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Submit"}</Button>
        {success && <span className="text-sm text-emerald-600">Saved.</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  )
}
