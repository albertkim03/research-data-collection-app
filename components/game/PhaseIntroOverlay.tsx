"use client";

import { useEffect, useState } from "react";

const COUNTDOWN_SECS = 5;

interface PhaseIntro {
  icon: string;
  title: string;
  description: string;
  tips: string[];
}

const PHASE_INTROS: Record<number, PhaseIntro> = {
  2: {
    icon: "🔍",
    title: "Explore the Café",
    description: "Look around the café and click on glowing items to discover their Russian names.",
    tips: [
      "Click an item to hear it pronounced in Russian",
      "Click again at any time to replay the audio",
      "Find all 12 items for a +50 bonus!",
    ],
  },
  3: {
    icon: "📖",
    title: "Memory Study",
    description: "Take your time to study the café items — you'll be tested on them shortly!",
    tips: [
      "Click each card to flip it and hear the Russian pronunciation",
      "You have 300 seconds — or click 'I'm Ready' when you feel confident",
      "Pay close attention — you'll need to identify these items by ear",
    ],
  },
  31: {
    icon: "🧠",
    title: "Memory Quiz!",
    description: "Study time is over. Now identify each café item by its Russian name!",
    tips: [
      "3 rounds, getting harder each time",
      "Round 3 rewards fast answers with a speed bonus",
      "You can replay the audio before choosing",
    ],
  },
  4: {
    icon: "📚",
    title: "Vocabulary Lesson",
    description: "Before serving customers, learn essential Russian numbers and phrases.",
    tips: [
      "Click each card to flip it and hear the pronunciation",
      "No timer here — take your time!",
    ],
  },
  5: {
    icon: "🔥",
    title: "Phrase Fever!",
    description: "A fast-paced quiz on numbers and phrases. You have 8 seconds per question!",
    tips: [
      "Audio plays automatically — listen carefully",
      "Answer quickly for a speed bonus (+5 pts)",
      "Build a combo streak to multiply your score!",
    ],
  },
  6: {
    icon: "☕",
    title: "Café Role-play",
    description: "Customers will order in Russian! Drag the correct items onto the counter to serve them.",
    tips: [
      "Listen to the order carefully (you can replay it)",
      "Drag items from the inventory sidebar to the counter",
      "Adjust quantities with the +/− controls below the counter",
    ],
  },
  7: {
    icon: "📋",
    title: "Final Review & Quiz",
    description: "First, review all vocabulary you've learned. Then complete a short final quiz!",
    tips: [
      "Click any item in the review board to hear it again",
      "The quiz has 6 questions — each worth up to 35 points",
      "Answer quickly for a speed bonus!",
    ],
  },
};

interface Props {
  phase: number;
  onClose: () => void;
}

export default function PhaseIntroOverlay({ phase, onClose }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECS);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const intro = PHASE_INTROS[phase];
  if (!intro) return null;

  const pct = ((COUNTDOWN_SECS - secondsLeft) / COUNTDOWN_SECS) * 100;
  const canClose = secondsLeft === 0;

  return (
    <div className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-5">
        {/* Icon + title */}
        <div className="text-center space-y-2">
          <div className="text-5xl">{intro.icon}</div>
          <h2 className="text-2xl font-black text-gray-900">{intro.title}</h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center leading-relaxed">{intro.description}</p>

        {/* Tips */}
        <ul className="space-y-2 bg-amber-50 rounded-xl p-4 border border-amber-100">
          {intro.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">→</span>
              {tip}
            </li>
          ))}
        </ul>

        {/* Close button + countdown */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            disabled={!canClose}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all ${
              canClose
                ? "bg-amber-700 hover:bg-amber-800 text-white cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {canClose ? "Let's Go! →" : `Let's Go! — ${secondsLeft}s`}
          </button>

          {/* Progress bar — depletes while countdown active */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-amber-500 rounded-full"
              style={{ width: `${pct}%`, transition: "width 1s linear" }}
            />
          </div>
          {!canClose && (
            <p className="text-center text-xs text-gray-400">
              Read the tips above before continuing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
