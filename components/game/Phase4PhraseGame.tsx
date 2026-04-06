"use client";

import { useEffect, useRef, useState } from "react";
import { NUMBERS, PHRASES } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { shuffle } from "@/utils/shuffle";
import SpeakingAvatar from "./SpeakingAvatar";

const TOTAL_QUESTIONS = 12;
const QUESTION_MS = 4000;
const BASE_PTS = 10;
const COMBO_MULT = [1, 1.5, 2, 2.5, 3] as const;

interface FeverQ {
  audioPath: string;
  prompt: string;
  correctId: string;
  options: { id: string; label: string }[];
}

const NUMBER_LABELS: Record<string, string> = {
  one:   "1 · один",
  two:   "2 · два",
  three: "3 · три",
  four:  "4 · четыре",
  five:  "5 · пять",
};
const PHRASE_LABELS: Record<string, string> = {
  hello:    "Hello",
  thank_you:"Thank you",
  please:   "Please",
  yes:      "Yes",
  no:       "No",
  goodbye:  "Goodbye",
};

const RAW_QUESTIONS = [
  // 5 number questions
  { audioPath: NUMBERS[0].audioPath, prompt: "What number did you hear?",       correctId: "one",      pool: ["one","two","three","four"] },
  { audioPath: NUMBERS[1].audioPath, prompt: "What number did you hear?",       correctId: "two",      pool: ["one","two","four","five"] },
  { audioPath: NUMBERS[2].audioPath, prompt: "What number did you hear?",       correctId: "three",    pool: ["two","three","four","five"] },
  { audioPath: NUMBERS[3].audioPath, prompt: "What number did you hear?",       correctId: "four",     pool: ["one","two","three","four"] },
  { audioPath: NUMBERS[4].audioPath, prompt: "What number did you hear?",       correctId: "five",     pool: ["two","three","four","five"] },
  // 6 phrase questions
  { audioPath: PHRASES[0].audioPath, prompt: "What does this phrase mean?",     correctId: "hello",    pool: ["hello","goodbye","thank_you","please"] },
  { audioPath: PHRASES[1].audioPath, prompt: "What does this phrase mean?",     correctId: "thank_you",pool: ["thank_you","hello","yes","goodbye"] },
  { audioPath: PHRASES[2].audioPath, prompt: "What does this phrase mean?",     correctId: "please",   pool: ["please","no","thank_you","yes"] },
  { audioPath: PHRASES[3].audioPath, prompt: "What does this phrase mean?",     correctId: "yes",      pool: ["yes","no","hello","please"] },
  { audioPath: PHRASES[4].audioPath, prompt: "What does this phrase mean?",     correctId: "no",       pool: ["no","yes","goodbye","thank_you"] },
  { audioPath: PHRASES[5].audioPath, prompt: "What does this phrase mean?",     correctId: "goodbye",  pool: ["goodbye","hello","thank_you","please"] },
  // Bonus contextual question
  { audioPath: NUMBERS[2].audioPath, prompt: 'The customer says "три" — how many items?', correctId: "three", pool: ["one","two","three","four"] },
];

interface Props {
  onScoreGain: (pts: number) => void;
  onComplete: () => void;
}

export default function Phase4PhraseGame({ onScoreGain, onComplete }: Props) {
  // Shuffle options once at mount — stable for the lifetime of this component
  const [questions] = useState<FeverQ[]>(() =>
    RAW_QUESTIONS.map((q) => ({
      audioPath: q.audioPath,
      prompt: q.prompt,
      correctId: q.correctId,
      options: shuffle([...q.pool]).map((id) => ({
        id,
        label: NUMBER_LABELS[id] ?? PHRASE_LABELS[id] ?? id,
      })),
    }))
  );

  const [qIndex, setQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phaseScore, setPhaseScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_MS);
  const [done, setDone] = useState(false);

  const questionStartRef = useRef(Date.now());
  const answeredRef = useRef(false);
  const { play, isPlaying } = useAudio();
  const { playCorrect, playWrong } = useSoundEffect();

  const currentQ = questions[qIndex];

  // Reset state and auto-play audio on each new question
  useEffect(() => {
    if (done) return;
    setSelectedId(null);
    setFeedback(null);
    setTimeLeft(QUESTION_MS);
    questionStartRef.current = Date.now();
    answeredRef.current = false;
    const t = setTimeout(() => play(currentQ.audioPath), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, done]);

  // 4-second countdown — auto-marks wrong at 0
  useEffect(() => {
    if (feedback !== null || done) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => Math.max(0, p - 100)), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, feedback, done]);

  function handleAnswer(optId: string | null) {
    if (answeredRef.current || feedback !== null) return;
    answeredRef.current = true;

    const correct = optId !== null && optId === currentQ.correctId;
    setSelectedId(optId);
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      playCorrect();
      const elapsed = Date.now() - questionStartRef.current;
      const speedBonus = elapsed < 1500 ? 5 : 0;
      const multIdx = Math.min(combo, COMBO_MULT.length - 1);
      const pts = Math.round((BASE_PTS + speedBonus) * COMBO_MULT[multIdx]);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setCorrectCount((c) => c + 1);
      setPhaseScore((s) => s + pts);
      onScoreGain(pts);
    } else {
      playWrong();
      setCombo(0);
    }

    // Auto-advance after brief feedback display (arcade style — timer drives the pacing)
    setTimeout(() => {
      if (qIndex + 1 >= TOTAL_QUESTIONS) {
        setDone(true);
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1200);
  }

  const timerPct = (timeLeft / QUESTION_MS) * 100;
  const timerColor = timeLeft > 2000 ? "bg-green-500" : timeLeft > 1000 ? "bg-yellow-400" : "bg-red-500";
  const currentMult = COMBO_MULT[Math.min(combo, COMBO_MULT.length - 1)];

  // ── Done screen ───────────────────────────────────────────────
  if (done) {
    const accuracy = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const bestMult = maxCombo >= 1
      ? COMBO_MULT[Math.min(maxCombo - 1, COMBO_MULT.length - 1)]
      : 1;

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl p-8 text-center space-y-5 border border-gray-700">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-black text-white">Phrase Fever Complete!</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-2xl font-black text-amber-400">{correctCount}/{TOTAL_QUESTIONS}</div>
              <div className="text-xs text-gray-400 mt-1">Correct</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-2xl font-black text-orange-400">{accuracy}%</div>
              <div className="text-xs text-gray-400 mt-1">Accuracy</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-2xl font-black text-purple-400">
                {maxCombo >= 2 ? `×${bestMult}` : "—"}
              </div>
              <div className="text-xs text-gray-400 mt-1">Best Combo</div>
            </div>
          </div>

          <div className="bg-amber-900 bg-opacity-40 rounded-xl p-4 border border-amber-700">
            <div className="text-amber-400 text-sm font-bold">Points earned this round</div>
            <div className="text-4xl font-black text-amber-300">+{phaseScore}</div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-lg rounded-xl transition-colors"
          >
            Continue to Role-play →
          </button>
        </div>
      </div>
    );
  }

  // ── Game screen ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm font-bold">
            Q {qIndex + 1} / {TOTAL_QUESTIONS}
          </div>
          <div className="flex items-center gap-3">
            {combo >= 1 && (
              <span className="text-orange-400 font-black text-sm animate-pulse">
                🔥 ×{currentMult} COMBO
              </span>
            )}
            <span className="text-amber-400 font-black">⭐ {phaseScore}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${timerColor}`}
            style={{ width: `${timerPct}%`, transition: "width 0.1s linear, background-color 0.3s" }}
          />
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < qIndex
                  ? "w-2.5 h-2.5 bg-amber-500"
                  : i === qIndex
                  ? "w-3 h-3 bg-white"
                  : "w-2 h-2 bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Question card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <div className="space-y-2">
              <p className="text-gray-200 font-semibold">{currentQ.prompt}</p>
              <button
                onClick={() => play(currentQ.audioPath)}
                disabled={isPlaying}
                className="bg-amber-800 hover:bg-amber-700 disabled:bg-gray-700 text-amber-200 font-bold px-4 py-1.5 rounded-lg text-sm transition-colors"
              >
                🔊 {isPlaying ? "Playing…" : "Replay"}
              </button>
            </div>
          </div>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isCorrect = opt.id === currentQ.correctId;
            let cls =
              "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:border-amber-500 cursor-pointer";
            if (feedback !== null) {
              if (isCorrect)       cls = "bg-green-900 border-green-500 text-green-100 scale-105";
              else if (isSelected) cls = "bg-red-900 border-red-500 text-red-200";
              else                 cls = "bg-gray-800 border-gray-700 text-gray-500 opacity-40";
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={feedback !== null}
                className={`border-2 rounded-xl p-4 font-bold text-base transition-all text-center ${cls}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Feedback banner */}
        {feedback !== null && (
          <div
            className={`rounded-xl p-3 text-center font-bold ${
              feedback === "correct"
                ? "bg-green-900 border border-green-600 text-green-300"
                : "bg-red-900 border border-red-600 text-red-300"
            }`}
          >
            {feedback === "correct"
              ? `✓ Correct!${combo >= 2 ? ` 🔥 ×${COMBO_MULT[Math.min(combo - 1, COMBO_MULT.length - 1)]} combo!` : ""}`
              : `✗ Answer: ${NUMBER_LABELS[currentQ.correctId] ?? PHRASE_LABELS[currentQ.correctId] ?? currentQ.correctId}`}
          </div>
        )}
      </div>
    </div>
  );
}
