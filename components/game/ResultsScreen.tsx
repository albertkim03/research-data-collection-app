"use client";

import type { GameState, SessionLog } from "@/types/game";
import Link from "next/link";

const MAX_SCORE = 1220; // approximate: 15 tutorial + 170 explore + 380 recall + 460 roleplay + 210 recap

interface Props {
  gameState: GameState;
  totalTimeMs: number;
}

export default function ResultsScreen({ gameState, totalTimeMs }: Props) {
  const { score, discoveredItems, recallResults, orderResults, recapResults } = gameState;

  const recallCorrect = recallResults.filter((r) => r.correct).length;
  const ordersCorrect = orderResults.filter((r) => r.correct).length;
  const recapCorrect = recapResults.filter((r) => r.correct).length;
  const pct = Math.round((score / MAX_SCORE) * 100);

  const stars =
    pct >= 90 ? 4 : pct >= 70 ? 3 : pct >= 40 ? 2 : 1;
  const starLabel = ["", "Keep practising!", "Good effort!", "Great performance!", "Outstanding!"][stars];

  const totalMins = Math.floor(totalTimeMs / 60000);
  const totalSecs = Math.floor((totalTimeMs % 60000) / 1000);

  function downloadLog() {
    const log: SessionLog = {
      participantId: gameState.participantId,
      condition: "desktop",
      sessionDate: new Date().toISOString(),
      totalScore: score,
      totalTimeMs,
      phases: [
        { phase: 1, startTime: gameState.startTime, endTime: gameState.startTime + 300000, score: 15 },
      ],
      discoveredItems,
      recallResults,
      orderResults,
      recapResults,
    };
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${gameState.participantId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">🏆</div>
          <h1 className="text-3xl font-bold text-amber-900">Session Complete!</h1>
          <div className="text-5xl font-mono font-black text-amber-700">
            {score} <span className="text-2xl text-gray-400">/ {MAX_SCORE}</span>
          </div>
          <div className="flex justify-center gap-1 text-3xl">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={i < stars ? "text-yellow-400" : "text-gray-200"}>★</span>
            ))}
          </div>
          <p className="text-gray-600 font-semibold">{starLabel}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <StatRow label="Explore" value={`${discoveredItems.length} / 12 items found`} />
          <StatRow label="Memory" value={`${recallCorrect} / 12 correct (${Math.round((recallCorrect / 12) * 100)}%)`} />
          <StatRow label="Orders" value={`${ordersCorrect} / 8 delivered`} />
          <StatRow label="Recap" value={`${recapCorrect} / 6 correct`} />
          <div className="border-t pt-3 flex justify-between text-sm text-gray-500">
            <span>Total time</span>
            <span className="font-mono">{String(totalMins).padStart(2, "0")}:{String(totalSecs).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={downloadLog}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
          >
            Download Session Log (JSON)
          </button>
          <Link href="/" className="block">
            <button className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-xl transition-colors">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
