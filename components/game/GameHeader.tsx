"use client";

import { useTimer } from "@/hooks/useTimer";

const PHASE_LABELS = ["", "Tutorial", "Explore", "Memory", "Vocab", "Role-play", "Recap", "Results"];
const TOTAL_LEARNING_PHASES = 6; // phases 1–6; phase 7 is results

interface Props {
  phase: number;
  score: number;
  gameStarted: boolean;
}

export default function GameHeader({ phase, score, gameStarted }: Props) {
  const { formatted } = useTimer(gameStarted && phase >= 1 && phase <= 6);

  const progressPct = Math.min(((phase - 1) / TOTAL_LEARNING_PHASES) * 100, 100);

  return (
    <div className="sticky top-0 z-40 bg-amber-900 text-white shadow-md">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">Café Русский</span>
          {phase >= 1 && phase <= 7 && (
            <span className="bg-amber-700 rounded-full px-3 py-0.5 text-sm">
              Phase {Math.min(phase, 6)}/6: {PHASE_LABELS[phase] ?? "Results"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm font-mono">
          {gameStarted && <span>⏱ {formatted}</span>}
          <span className="font-bold text-amber-200 text-lg">⭐ {score} pts</span>
        </div>
      </div>
      {/* Overall progress bar */}
      <div className="h-1.5 bg-amber-800">
        <div
          className="h-1.5 bg-amber-300 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
