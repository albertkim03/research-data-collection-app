"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { useCountdown } from "@/hooks/useTimer";
import type { VocabItem } from "@/types/game";

// Positions as [left%, top%] within the café scene container
const ITEM_POSITIONS: Record<string, [number, number]> = {
  bill:   [67,  22],
  coffee: [29,  62],
  tea:    [29.5, 85],
  juice:  [23,  28],
  water:  [95,  62],
  milk:   [30,  19],
  menu:   [49,  15],
  spoon:  [56,  46],
  sugar:  [17,  55],
  bread:  [52,  60],
  soup:   [67,  68],
  cake:   [70,  53],
};

interface ItemClickState {
  [itemId: string]: { discovered: boolean; labelVisible: boolean; reclicks: number };
}

interface Props {
  initialDiscovered: string[];
  onScoreGain: (pts: number) => void;
  onComplete: (discovered: string[]) => void;
}

export default function Phase2Explore({ initialDiscovered, onScoreGain, onComplete }: Props) {
  const { play } = useAudio();
  const [itemState, setItemState] = useState<ItemClickState>(() => {
    const s: ItemClickState = {};
    CAFE_ITEMS.forEach((item) => {
      s[item.id] = {
        discovered: initialDiscovered.includes(item.id),
        labelVisible: false,
        reclicks: 0,
      };
    });
    return s;
  });
  const [milestone, setMilestone] = useState<string | null>(null);
  const [allFound, setAllFound] = useState(false);
  const [showOneMinWarning, setShowOneMinWarning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Keep a ref of discovered IDs that's always current (for closure safety)
  const discoveredRef = useRef<string[]>(initialDiscovered);

  const discovered = Object.entries(itemState)
    .filter(([, s]) => s.discovered)
    .map(([id]) => id);
  const discoveredCount = discovered.length;

  // Keep ref in sync
  useEffect(() => {
    discoveredRef.current = discovered;
  }, [discovered]);

  const handleTimeUp = useCallback(() => {
    setTimedOut(true);
  }, []);

  const { remaining: timeRemaining } = useCountdown(300, !allFound, handleTimeUp);
  const timerMins = Math.floor(timeRemaining / 60);
  const timerSecs = timeRemaining % 60;
  const timerUrgent = timeRemaining <= 60 && timeRemaining > 0;

  // 1-minute warning
  useEffect(() => {
    if (timeRemaining === 60 && !allFound) {
      setShowOneMinWarning(true);
      const t = setTimeout(() => setShowOneMinWarning(false), 6000);
      return () => clearTimeout(t);
    }
  }, [timeRemaining, allFound]);

  // Halfway milestone
  useEffect(() => {
    if (discoveredCount === 6) {
      setMilestone("Halfway there! Keep exploring.");
      const t = setTimeout(() => setMilestone(null), 3000);
      return () => clearTimeout(t);
    }
  }, [discoveredCount]);

  // All items found
  useEffect(() => {
    if (discoveredCount === CAFE_ITEMS.length && !allFound) {
      setAllFound(true);
      onScoreGain(50);
      setMilestone("🎉 All items found! +50 bonus!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveredCount]);

  function handleClick(item: VocabItem) {
    play(item.audioPath);
    const wasDiscovered = itemState[item.id].discovered;

    setItemState((prev) => {
      const current = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          discovered: true,
          labelVisible: true,
          reclicks: current.discovered ? current.reclicks + 1 : 0,
        },
      };
    });

    if (!wasDiscovered) {
      onScoreGain(10);
    }

    setTimeout(() => {
      setItemState((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], labelVisible: false },
      }));
    }, 4000);
  }

  return (
    <div className="bg-amber-50 pb-6">
      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-3">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow px-4 py-2.5">
          <span className="font-semibold text-amber-900 text-sm">
            Items found: <strong>{discoveredCount} / {CAFE_ITEMS.length}</strong>
          </span>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {CAFE_ITEMS.map((item) => (
                <span
                  key={item.id}
                  className={`text-base transition-all ${itemState[item.id].discovered ? "opacity-100" : "opacity-20 grayscale"}`}
                >
                  {item.emoji}
                </span>
              ))}
            </div>
            <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg ${timerUrgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
              ⏱ {String(timerMins).padStart(2, "0")}:{String(timerSecs).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* 1-minute warning banner */}
        {showOneMinWarning && (
          <div className="bg-red-500 text-white text-center py-2.5 rounded-xl font-bold text-sm shadow-lg animate-bounce">
            ⚠️ 1 minute remaining! Try to find the last items!
          </div>
        )}

        {/* Milestone banner */}
        {milestone && !showOneMinWarning && (
          <div className="bg-amber-500 text-white text-center py-2.5 rounded-xl font-bold text-sm shadow-lg">
            {milestone}
          </div>
        )}

        {/* Café scene */}
        <div
          className="relative w-full rounded-2xl overflow-visible shadow-xl border-4 border-amber-800"
          style={{ paddingTop: "56.25%" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/phase-2-assets/phase-2-background.png"
            alt="Café background"
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />

          {/* Clickable items */}
          {CAFE_ITEMS.map((item) => {
            const [left, top] = ITEM_POSITIONS[item.id];
            const state = itemState[item.id];
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                style={{ left: `${left}%`, top: `${top}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center
                  rounded-xl px-2 py-1 border-2 transition-all cursor-pointer
                  ${state.labelVisible ? "z-[9999]" : "z-10"}
                  ${state.discovered
                    ? "border-green-400 bg-white bg-opacity-90"
                    : "border-amber-400 bg-white bg-opacity-80 animate-pulse hover:scale-110"
                  }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                {state.discovered && !state.labelVisible && (
                  <span className="text-green-600 text-xs font-bold">{item.russian}</span>
                )}
                {state.labelVisible && (
                  <div className="absolute bottom-full mb-2 bg-white border border-amber-300 rounded-lg px-3 py-2 shadow-xl text-center whitespace-nowrap">
                    <div className="text-base font-bold text-amber-900">{item.russian}</div>
                    <div className="text-xs text-gray-500 italic">({item.transliteration})</div>
                    <div className="text-xs text-gray-600">{item.english}</div>
                  </div>
                )}
                {state.discovered && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">✓</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-amber-700 text-sm">
          Click glowing items to discover them! Click again to replay the audio.
        </p>

        {allFound && (
          <button
            onClick={() => onComplete(discoveredRef.current)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
          >
            Continue to Memory Test →
          </button>
        )}
      </div>

      {/* Timer expired overlay */}
      {timedOut && !allFound && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center space-y-4 max-w-sm w-full shadow-2xl">
            <div className="text-5xl">⏰</div>
            <h2 className="text-2xl font-bold text-gray-800">Time&apos;s Up!</h2>
            <p className="text-gray-500">
              You found <strong>{discoveredCount}</strong> out of {CAFE_ITEMS.length} items.
            </p>
            <button
              onClick={() => onComplete(discoveredRef.current)}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
            >
              Continue to Memory Test →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
