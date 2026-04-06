"use client";

import type { VocabItem } from "@/types/game";
import { useAudio } from "@/hooks/useAudio";

interface Props {
  item: VocabItem;
  showEnglish?: boolean;
  showTranslit?: boolean;
  showAudio?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VocabCard({
  item,
  showEnglish = true,
  showTranslit = true,
  showAudio = true,
  size = "md",
  className = "",
}: Props) {
  const { play, isPlaying } = useAudio();

  const sizeClasses = {
    sm: "p-2 text-xs gap-1",
    md: "p-3 text-sm gap-1.5",
    lg: "p-4 text-base gap-2",
  };

  const emojiSize = { sm: "text-2xl", md: "text-4xl", lg: "text-5xl" };
  const russianSize = { sm: "text-base", md: "text-xl", lg: "text-2xl" };

  return (
    <div
      className={`flex flex-col items-center rounded-lg border border-amber-200 bg-amber-50 cursor-pointer transition-all hover:border-amber-400 hover:shadow-md ${sizeClasses[size]} ${className}`}
      onClick={() => showAudio && play(item.audioPath)}
    >
      <span className={emojiSize[size]}>{item.emoji}</span>
      <span className={`font-bold text-gray-800 ${russianSize[size]}`}>{item.russian}</span>
      {showTranslit && <span className="text-gray-500 italic">{item.transliteration}</span>}
      {showEnglish && <span className="text-gray-600">{item.english}</span>}
      {showAudio && (
        <span className={`mt-1 ${isPlaying ? "text-amber-600" : "text-gray-400"}`}>
          {isPlaying ? "▶" : "🔊"}
        </span>
      )}
    </div>
  );
}
