"use client";

import { useState } from "react";
import { NUMBERS, PHRASES } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import type { VocabItem } from "@/types/game";

interface Props {
  onComplete: () => void;
}

function FlipCard({ item, onFlip }: { item: VocabItem; onFlip: (item: VocabItem) => void }) {
  const [flipped, setFlipped] = useState(false);

  function handleClick() {
    if (!flipped) setFlipped(true);
    onFlip(item);
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer select-none"
      style={{ perspective: "1000px" }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          height: "150px",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-shadow p-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-3xl mb-1">{item.emoji}</span>
          <span className="text-sm font-semibold text-gray-700 text-center">{item.english}</span>
          <span className="text-xs text-gray-400 mt-2">🔊 Click to hear</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 border-2 border-blue-400 rounded-xl p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-2xl mb-1">{item.emoji}</span>
          <span className="text-xl font-bold text-blue-900 text-center">{item.russian}</span>
          <span className="text-sm text-gray-500 italic mt-1 text-center">({item.transliteration})</span>
          <span className="text-xs text-green-600 mt-1">🔊</span>
        </div>
      </div>
    </div>
  );
}

export default function Phase4VocabLearn({ onComplete }: Props) {
  const { play } = useAudio();

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow px-6 py-4">
          <h2 className="text-xl font-bold text-blue-900">Phase 4: New Vocabulary</h2>
          <p className="text-gray-500 text-sm mt-1">
            Before serving customers, learn these numbers and phrases. Click each card to hear the pronunciation.
          </p>
        </div>

        {/* Numbers section */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span>🔢</span> Numbers (1–5)
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {NUMBERS.map((item) => (
              <FlipCard key={item.id} item={item} onFlip={(i) => play(i.audioPath)} />
            ))}
          </div>
        </div>

        {/* Phrases section */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span>💬</span> Common Phrases
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {PHRASES.map((item) => (
              <FlipCard key={item.id} item={item} onFlip={(i) => play(i.audioPath)} />
            ))}
          </div>
        </div>

        <div className="bg-blue-100 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm text-center">
          <strong>Tip:</strong> You&apos;ll use these words when serving customers in the next phase. Take your time!
        </div>

        <button
          onClick={onComplete}
          className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg rounded-xl transition-colors shadow"
        >
          I&apos;m Ready — Start the Role-play →
        </button>
      </div>
    </div>
  );
}
