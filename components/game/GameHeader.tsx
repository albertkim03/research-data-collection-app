"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "@/hooks/useTimer";

const PHASE_LABELS = ["", "Tutorial", "Explore", "Memory", "Vocab", "Phrase Fever", "Role-play", "Recap", "Results"];
const TOTAL_LEARNING_PHASES = 7;

interface Props {
  phase: number;
  score: number;
  gameStarted: boolean;
}

export default function GameHeader({ phase, score, gameStarted }: Props) {
  const router = useRouter();
  const { formatted } = useTimer(gameStarted && phase >= 1 && phase <= 7);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const progressPct = Math.min(((phase - 1) / TOTAL_LEARNING_PHASES) * 100, 100);

  return (
    <>
      <div className="sticky top-0 z-40 bg-amber-900 text-white shadow-md">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1.5 text-amber-200 hover:text-white text-sm font-medium transition-colors shrink-0"
          >
            ← Exit
          </button>

          {/* Phase indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-base hidden sm:block">Café Русский</span>
            {phase >= 1 && phase <= 8 && (
              <span className="bg-amber-700 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap">
                Phase {Math.min(phase, 7)}/7: {PHASE_LABELS[phase] ?? "Results"}
              </span>
            )}
          </div>

          {/* Score + timer */}
          <div className="flex items-center gap-3 text-sm font-mono shrink-0">
            {gameStarted && <span className="text-amber-300">⏱ {formatted}</span>}
            <span className="font-black text-amber-200 text-base tabular-nums">⭐ {score}</span>
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

      {/* Exit confirmation dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center space-y-4 max-w-sm w-full shadow-2xl">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800">Exit the Game?</h2>
            <p className="text-gray-500 text-sm">
              All your progress and points will be lost. Are you sure you want to leave?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400 transition-colors"
              >
                Keep Playing
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
