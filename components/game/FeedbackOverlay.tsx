"use client";

import { useEffect, useState } from "react";

interface Props {
  correct: boolean | null;
  message?: string;
  points?: number;
  onDone?: () => void;
  durationMs?: number;
}

export default function FeedbackOverlay({ correct, message, points, onDone, durationMs = 1500 }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [correct, message, durationMs, onDone]);

  if (!visible || correct === null) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div
        className={`rounded-2xl px-10 py-6 text-center shadow-2xl text-white text-3xl font-bold animate-bounce
          ${correct ? "bg-green-500" : "bg-red-500"}`}
      >
        <div>{correct ? "✓ Правильно!" : "✗ Неверно"}</div>
        {message && <div className="text-lg font-normal mt-1">{message}</div>}
        {points !== undefined && points !== 0 && (
          <div className="text-xl mt-1">{points > 0 ? `+${points} pts` : `${points} pts`}</div>
        )}
      </div>
    </div>
  );
}
