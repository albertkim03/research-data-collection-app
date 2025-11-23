"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ConfirmSubmit({
  onConfirm,
  disabled,
}: { onConfirm: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} disabled={disabled}>
        Submit
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Submit now?</h3>
            <p className="mb-4 text-sm text-muted">
              Are you sure? You can only submit once. A PDF will be generated and sent to the researcher.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => { setOpen(false); onConfirm(); }}>Yes, submit</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
