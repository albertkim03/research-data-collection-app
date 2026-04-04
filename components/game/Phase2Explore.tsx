"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { useCountdown } from "@/hooks/useTimer";
import type { VocabItem } from "@/types/game";

// Positions as [left%, top%] within the café scene container
const ITEM_POSITIONS: Record<string, [number, number]> = {
  bill:   [6,  38],
  coffee: [6,  52],
  tea:    [6,  66],
  juice:  [18, 38],
  water:  [18, 52],
  milk:   [18, 66],
  menu:   [38, 46],
  spoon:  [38, 62],
  sugar:  [56, 46],
  bread:  [56, 62],
  soup:   [46, 80],
  cake:   [80, 30],
};

interface ItemClickState {
  [itemId: string]: { discovered: boolean; labelVisible: boolean; reclicks: number };
}

interface Props {
  initialDiscovered: string[];
  onComplete: (discovered: string[], pointsEarned: number) => void;
}

export default function Phase2Explore({ initialDiscovered, onComplete }: Props) {
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
  const pointsRef = useRef(0);

  const discovered = Object.entries(itemState)
    .filter(([, s]) => s.discovered)
    .map(([id]) => id);
  const discoveredCount = discovered.length;

  // 5-minute timer — auto-advances when it hits 0
  const handleTimeUp = useCallback(() => {
    onComplete(discovered, pointsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { remaining: timeRemaining } = useCountdown(300, !allFound, handleTimeUp);
  const timerMins = Math.floor(timeRemaining / 60);
  const timerSecs = timeRemaining % 60;
  const timerUrgent = timeRemaining <= 60;

  useEffect(() => {
    if (discoveredCount === 6) {
      setMilestone("Halfway there! Keep exploring.");
      const t = setTimeout(() => setMilestone(null), 3000);
      return () => clearTimeout(t);
    }
  }, [discoveredCount]);

  useEffect(() => {
    if (discoveredCount === CAFE_ITEMS.length && !allFound) {
      setAllFound(true);
      pointsRef.current += 50;
      setMilestone("🎉 All items found! +50 bonus! Ready to continue?");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveredCount]);

  function handleClick(item: VocabItem) {
    play(item.audioPath);

    setItemState((prev) => {
      const current = prev[item.id];
      const wasDiscovered = current.discovered;
      return {
        ...prev,
        [item.id]: {
          discovered: true,
          labelVisible: true,
          reclicks: wasDiscovered ? current.reclicks + 1 : 0,
        },
      };
    });

    if (!itemState[item.id].discovered) {
      pointsRef.current += 10;
    }

    setTimeout(() => {
      setItemState((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], labelVisible: false },
      }));
    }, 4000);
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow px-6 py-3">
          <span className="font-semibold text-amber-900">
            Items discovered: <strong>{discoveredCount} / {CAFE_ITEMS.length}</strong>
          </span>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {CAFE_ITEMS.map((item) => (
                <span
                  key={item.id}
                  className={`text-lg transition-all ${itemState[item.id].discovered ? "opacity-100" : "opacity-20 grayscale"}`}
                >
                  {item.emoji}
                </span>
              ))}
            </div>
            {/* Countdown timer */}
            <span className={`font-mono font-bold text-sm px-3 py-1 rounded-lg ${timerUrgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
              ⏱ {String(timerMins).padStart(2, "0")}:{String(timerSecs).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Milestone banner */}
        {milestone && (
          <div className="bg-amber-500 text-white text-center py-3 rounded-xl font-bold text-lg shadow-lg">
            {milestone}
          </div>
        )}

        {/* Café scene */}
        <div
          className="relative w-full rounded-2xl overflow-visible shadow-xl border-4 border-amber-800"
          style={{ paddingTop: "56.25%" }}
        >
          {/* Background image */}
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
                    {!itemState[item.id].discovered && (
                      <div className="text-green-600 font-bold text-xs">+10 pts!</div>
                    )}
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

        {/* Continue button — only shown when all items found */}
        {allFound && (
          <button
            onClick={() => onComplete(discovered, pointsRef.current)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
          >
            Continue to Memory Test →
          </button>
        )}
      </div>
    </div>
  );
}
