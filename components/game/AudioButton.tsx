"use client";

import { useAudio } from "@/hooks/useAudio";

interface Props {
  path: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AudioButton({ path, label, size = "md", className = "" }: Props) {
  const { play, isPlaying } = useAudio();

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      onClick={() => play(path)}
      disabled={isPlaying}
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors
        ${isPlaying ? "bg-amber-100 border-amber-400 text-amber-700 cursor-not-allowed" : "bg-white border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer"}
        ${sizes[size]} ${className}`}
    >
      <span>{isPlaying ? "▶" : "🔊"}</span>
      {label && <span>{label}</span>}
    </button>
  );
}
