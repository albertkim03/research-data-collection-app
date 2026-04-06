# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm start        # Run production server
```

There are no automated tests in this project.

## Architecture Overview

This is a **Next.js App Router** research data collection app for a UNSW thesis. Authenticated users unlock 3 sequential research sections using passcodes, then fill out forms within each section. Form responses are **emailed to the researcher via Resend** — they are not stored in the database.

### Key Data Flow

1. **Auth** — Supabase Auth + middleware (`middleware.ts`) protects all routes. Users sign up/login at `/auth/*`.
2. **Section unlock** — Each section requires a passcode, verified against `sections.passcode` in Supabase. Unlocks are recorded in `passcode_unlocks` table.
3. **Form submission** — Two form types, both POST to `/api/forms/[formId]/submit`:
   - `kind='digital'` — Renders a `DynamicForm` with field types: `text`, `radio`, `scale` (NASA-TLX slider 0–100), `mcq` (multiple choice, optionally with audio). Supports auto-grading via `form_schema.answerKey`.
   - `kind='pdf'` — Renders a `PdfUploadForm` where users download a template PDF, fill it manually, then upload it (max 15MB). The PDF is emailed as an attachment.
4. **Email** — Resend sends all submissions to `EMAIL_TO`. Digital forms include prettified responses + optional grading table. PDF forms attach the file.

### Supabase Tables

- `public.sections` — section metadata + passcodes
- `public.forms` — form definitions including `form_schema` (JSON) and `kind`
- `public.form_responses` — tracks `submitted` boolean per user per form (prevents double-submit)
- `public.passcode_unlocks` — tracks which sections a user has unlocked
- `public.profiles` — user profile info

Form responses themselves are **not persisted** to the database.

### Form Schema Shape

Forms are driven by JSON stored in `forms.form_schema`:

```typescript
{
  version: 1,
  fields: [
    { key: "q1", type: "text", label: "...", required: true },
    { key: "q2", type: "radio", label: "...", options: ["A", "B", "C"] },
    { key: "q3", type: "scale", label: "...", min: 0, max: 100, step: 5 },
    { key: "q4", type: "mcq", label: "...", options: [...], notSure: true }
  ],
  answerKey?: { q2: "B" }  // optional, enables auto-grading
}
```

### Key Files

- `app/api/forms/[formId]/submit/route.ts` — single API endpoint handling both digital and PDF submissions
- `components/dynamic-form.tsx` — renders digital forms from schema
- `components/pdf-upload-form.tsx` — PDF download/upload UI
- `components/unlock-form.tsx` — section passcode entry
- `lib/supabase/client.ts` / `server.ts` — Supabase clients (browser vs server-side with cookies)
- `middleware.ts` — auth session refresh + route protection

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
EMAIL_TO=
EMAIL_FROM=
```

### UI Stack

Tailwind CSS + Radix UI primitives + Shadcn/ui components (configured via `components.json`). All Shadcn components live in `components/ui/`. Audio files for MCQ questions are in `public/game-mp3/` and `public/mp3/`. PDF templates are in `public/pdfs/`.
