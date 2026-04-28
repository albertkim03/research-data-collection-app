"use client";

import { useState } from "react";
import type { GameState } from "@/types/game";

// ─────────────────────────────────────────────────────────────
// Toggle this boolean to show/hide the admin controls panel.
// Set to false before deploying to participants.
// ─────────────────────────────────────────────────────────────
export const SHOW_ADMIN_CONTROLS = false;

const PHASE_NAMES: Record<number, string> = {
  1: "Tutorial",
  2: "Explore",
  3: "Memory",
  4: "Vocab",
  5: "Phrase Fever",
  6: "Role-play",
  7: "Recap",
  8: "Results",
};

interface Props {
  currentPhase: GameState["phase"];
  onJumpToPhase: (phase: GameState["phase"]) => void;
}

export default function AdminControls({ currentPhase, onJumpToPhase }: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {/* Toggle tab */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="bg-gray-800 text-white text-xs font-bold px-1.5 py-3 rounded-l-lg hover:bg-gray-700 transition-colors writing-mode-vertical"
        title="Toggle admin controls"
      >
        {expanded ? "›" : "‹"} ⚙
      </button>

      {/* Panel */}
      {expanded && (
        <div className="bg-gray-900 text-white rounded-l-xl shadow-2xl p-3 space-y-1.5 min-w-[130px]">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Admin — Jump to
          </div>
          {(Object.entries(PHASE_NAMES) as [string, string][]).map(([num, name]) => {
            const phaseNum = Number(num) as GameState["phase"];
            const isCurrent = currentPhase === phaseNum;
            return (
              <button
                key={phaseNum}
                onClick={() => onJumpToPhase(phaseNum)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${isCurrent
                    ? "bg-amber-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                {num}. {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
