"use client";

export interface PointGain {
  id: number;
  pts: number;
  label?: string;
}

interface Props {
  gains: PointGain[];
}

export default function FloatingPoints({ gains }: Props) {
  if (gains.length === 0) return null;
  return (
    <div className="fixed top-20 right-6 z-[300] flex flex-col items-end gap-2 pointer-events-none">
      {gains.map((g) => (
        <div
          key={g.id}
          className="animate-float-up flex items-center gap-1.5 bg-green-500 text-white font-black text-lg px-4 py-2 rounded-full shadow-lg"
        >
          <span>+{g.pts} pts</span>
          {g.label && <span className="text-sm font-medium opacity-90">{g.label}</span>}
        </div>
      ))}
    </div>
  );
}
