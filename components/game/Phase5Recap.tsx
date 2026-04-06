"use client";

import React, { useEffect, useRef, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { shuffle } from "@/utils/shuffle";
import type { RecallAttempt, RecapAttempt } from "@/types/game";
import SpeakingAvatar from "./SpeakingAvatar";
import { useSoundEffect } from "@/hooks/useSoundEffect";

// Static label maps — defined once outside component
const PHRASE_LABELS: Record<string, string> = {
  thank_you_en: "Thank you",
  hello_en:     "Hello",
  goodbye_en:   "Goodbye",
  please_en:    "Please",
  yes_en:       "Yes",
  cake_en:      "Cake",
  bread_en:     "Bread",
  soup_en:      "Soup",
  milk_en:      "Milk",
};

const ORDER_OPTION_LABELS: Record<string, React.ReactNode> = {
  "1coffee2bread": <div className="text-center"><div className="text-2xl">☕×1 + 🍞×2</div><div className="text-xs text-gray-500 mt-1">1 coffee + 2 bread</div></div>,
  "2coffee1bread": <div className="text-center"><div className="text-2xl">☕×2 + 🍞×1</div><div className="text-xs text-gray-500 mt-1">2 coffee + 1 bread</div></div>,
  "1soup2bread":   <div className="text-center"><div className="text-2xl">🍲×1 + 🍞×2</div><div className="text-xs text-gray-500 mt-1">1 soup + 2 bread</div></div>,
  "1coffee1bread": <div className="text-center"><div className="text-2xl">☕×1 + 🍞×1</div><div className="text-xs text-gray-500 mt-1">1 coffee + 1 bread</div></div>,
};

interface RecapQuestion {
  id: number;
  type: string;
  render: () => React.ReactNode;
  correctId: string;
  options: { id: string; label: React.ReactNode }[];
}

interface Props {
  wrongItemIds: string[];
  recallResults: RecallAttempt[];
  onScoreGain: (pts: number, label?: string) => void;
  onComplete: (results: RecapAttempt[]) => void;
}

type SubPhase = "review" | "quiz";

export default function Phase5Recap({ wrongItemIds, onScoreGain, onComplete }: Props) {
  const [subPhase, setSubPhase] = useState<SubPhase>("review");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [questionStart, setQuestionStart] = useState(0);
  const [results, setResults] = useState<RecapAttempt[]>([]);
  const [pointsEarned, setPointsEarned] = useState(0);
  const resultsRef = useRef<RecapAttempt[]>([]);
  const { play, playSequence, isPlaying } = useAudio();
  const { playCorrect, playWrong } = useSoundEffect();

  // Audio to auto-play when each question first appears (index matches question array)
  const QUESTION_AUTO_AUDIO: (string | string[])[] = [
    "/game-mp3/game-1/audio_milk_008.mp3",
    "/game-mp3/game-3/audio_thank_you_031.mp3",
    ["/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_coffee_001.mp3",
     "/game-mp3/game-2/audio_two_021.mp3", "/game-mp3/game-1/audio_bread_003.mp3"],
    "/game-mp3/game-1/audio_spoon_012.mp3",
    "/game-mp3/game-3/audio_goodbye_035.mp3",
    "/game-mp3/game-1/audio_cake_007.mp3",
  ];

  // Stable shuffled options — computed ONCE at mount, never reshuffled
  const [stableOpts] = useState(() => [
    shuffle(["milk", "bread", "soup", "water", "sugar", "spoon"]),    // Q1
    shuffle(["thank_you_en", "hello_en", "goodbye_en", "please_en"]), // Q2
    shuffle(["1coffee2bread", "2coffee1bread", "1soup2bread", "1coffee1bread"]), // Q3
    shuffle(["spoon", "menu", "bill", "sugar", "milk", "cake"]),      // Q4
    shuffle(["goodbye_en", "hello_en", "thank_you_en", "yes_en"]),    // Q5
    shuffle(["cake_en", "bread_en", "soup_en", "milk_en"]),           // Q6
  ]);

  function getCafeLabel(id: string): React.ReactNode {
    const item = CAFE_ITEMS.find((i) => i.id === id)!;
    return (
      <div className="flex flex-col items-center gap-1">
        {item.imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imagePath} alt={item.english} className="w-14 h-14 object-contain" />
        ) : (
          <span className="text-4xl">{item.emoji}</span>
        )}
        <span className="text-xs text-gray-500">{item.english}</span>
      </div>
    );
  }

  // Questions are rebuilt each render (for fresh play/isPlaying closures)
  // but option ORDER stays stable because stableOpts never changes.
  const questions: RecapQuestion[] = [
    {
      id: 1,
      type: "audio-to-image",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Hear the word, then click the correct item</p>
          <div className="flex items-center justify-center gap-3">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <button
              onClick={() => play("/game-mp3/game-1/audio_milk_008.mp3")}
              className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
            >
              🔊 {isPlaying ? "Playing…" : "Play word"}
            </button>
          </div>
        </div>
      ),
      correctId: "milk",
      options: stableOpts[0].map((id) => ({ id, label: getCafeLabel(id) })),
    },
    {
      id: 2,
      type: "audio-to-english-meaning",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to this Russian phrase — what does it mean?</p>
          <div className="flex items-center justify-center gap-3">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <button
              onClick={() => play("/game-mp3/game-3/audio_thank_you_031.mp3")}
              className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
            >
              🔊 {isPlaying ? "Playing…" : "Play phrase"}
            </button>
          </div>
        </div>
      ),
      correctId: "thank_you_en",
      options: stableOpts[1].map((id) => ({
        id,
        label: <span className="text-lg font-bold">{PHRASE_LABELS[id]}</span>,
      })),
    },
    {
      id: 3,
      type: "order-reconstruction",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to the order, then select the correct tray</p>
          <div className="flex items-center justify-center gap-3">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <button
              className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl hover:bg-amber-200 transition-colors"
              onClick={() => {
                play("/game-mp3/game-2/audio_one_020.mp3");
                setTimeout(() => play("/game-mp3/game-1/audio_coffee_001.mp3"), 900);
                setTimeout(() => play("/game-mp3/game-2/audio_two_021.mp3"), 1800);
                setTimeout(() => play("/game-mp3/game-1/audio_bread_003.mp3"), 2700);
              }}
            >
              🔊 {isPlaying ? "Playing…" : "Play order"}
            </button>
          </div>
        </div>
      ),
      correctId: "1coffee2bread",
      options: stableOpts[2].map((id) => ({ id, label: ORDER_OPTION_LABELS[id] })),
    },
    {
      id: 4,
      type: "audio-to-image",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Hear the word, then click the correct item</p>
          <div className="flex items-center justify-center gap-3">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <button
              onClick={() => play("/game-mp3/game-1/audio_spoon_012.mp3")}
              className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
            >
              🔊 {isPlaying ? "Playing…" : "Play word"}
            </button>
          </div>
        </div>
      ),
      correctId: "spoon",
      options: stableOpts[3].map((id) => ({ id, label: getCafeLabel(id) })),
    },
    {
      id: 5,
      type: "audio-to-english-meaning",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to this Russian phrase — what does it mean?</p>
          <div className="flex items-center justify-center gap-3">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <button
              onClick={() => play("/game-mp3/game-3/audio_goodbye_035.mp3")}
              className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
            >
              🔊 {isPlaying ? "Playing…" : "Play phrase"}
            </button>
          </div>
        </div>
      ),
      correctId: "goodbye_en",
      options: stableOpts[4].map((id) => ({
        id,
        label: <span className="text-lg font-bold">{PHRASE_LABELS[id]}</span>,
      })),
    },
    {
      id: 6,
      // Changed: removed emoji from prompt — audio-only so the image doesn't give it away
      type: "audio-to-english",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to this Russian word — what does it mean in English?</p>
          <div className="flex items-center justify-center gap-3">
            <SpeakingAvatar isSpeaking={isPlaying} />
            <button
              onClick={() => play("/game-mp3/game-1/audio_cake_007.mp3")}
              className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
            >
              🔊 {isPlaying ? "Playing…" : "Play word"}
            </button>
          </div>
        </div>
      ),
      correctId: "cake_en",
      options: stableOpts[5].map((id) => ({
        id,
        label: <span className="text-lg font-bold">{PHRASE_LABELS[id]}</span>,
      })),
    },
  ];

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (subPhase === "quiz") {
      setQuestionStart(Date.now());
      setFeedback(null);
      setSelectedId(null);
      setPointsEarned(0);
      // Auto-play audio once when each question appears
      const audio = QUESTION_AUTO_AUDIO[questionIndex];
      if (audio) {
        const t = setTimeout(() => {
          if (Array.isArray(audio)) playSequence(audio);
          else play(audio);
        }, 400);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPhase, questionIndex]);

  function handleAnswer(optionId: string) {
    if (feedback !== null) return;
    const responseTime = Date.now() - questionStart;
    const correct = optionId === currentQuestion.correctId;
    setSelectedId(optionId);
    setFeedback(correct);

    if (correct) playCorrect(); else playWrong();

    const basePoints = 25;
    const speedBonus = correct && responseTime < 3000 ? 10 : 0;
    const earned = correct ? basePoints + speedBonus : 0;
    setPointsEarned(earned);
    if (correct) onScoreGain(earned, speedBonus > 0 ? "⚡ Fast!" : undefined);

    const attempt: RecapAttempt = {
      questionNumber: currentQuestion.id,
      questionType: currentQuestion.type,
      correct,
      responseTimeMs: responseTime,
      timestamp: Date.now(),
    };
    const newResults = [...results, attempt];
    resultsRef.current = newResults;
    setResults(newResults);
    // No auto-advance — user clicks "Next Question" button
  }

  function handleNext() {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
    } else {
      onComplete(resultsRef.current);
    }
  }

  // ── Review Board ──────────────────────────────────────────
  if (subPhase === "review") {
    return (
      <div className="bg-amber-50 pb-6">
        <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
          <div className="bg-white rounded-xl shadow px-6 py-4">
            <h2 className="text-xl font-bold text-amber-900">Phase 6: Review Board</h2>
            <p className="text-gray-500 text-sm mt-1">
              Click any item to hear its pronunciation.
              {wrongItemIds.length > 0 && " Items marked with ⭐ are ones to pay extra attention to."}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {CAFE_ITEMS.map((item) => {
              const needsReview = wrongItemIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => play(item.audioPath)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                    ${needsReview ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white hover:border-amber-300"}`}
                >
                  {item.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imagePath} alt={item.english} className="w-14 h-14 object-contain mb-1" />
                  ) : (
                    <span className="text-4xl mb-1">{item.emoji}</span>
                  )}
                  <span className="text-base font-bold text-amber-900">{item.russian}</span>
                  <span className="text-xs text-gray-500 italic">{item.transliteration}</span>
                  <span className="text-xs text-gray-400">{item.english}</span>
                  {needsReview && <span className="text-xs text-amber-600 font-medium mt-1">⭐ Pay attention</span>}
                  <span className="text-gray-300 text-xs mt-1">🔊 click to hear</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSubPhase("quiz")}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
          >
            I&apos;m Ready → Final Challenge
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────
  return (
    <div className="bg-amber-50 pb-6">
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Progress header */}
        <div className="bg-white rounded-xl shadow px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-amber-600">+25 pts · bonus if under 3 seconds</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${(questionIndex / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question prompt */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          {currentQuestion.render()}
        </div>

        {/* Options */}
        <div className={`grid gap-3 ${currentQuestion.options.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isCorrect = opt.id === currentQuestion.correctId;
            let cls = "border-gray-200 hover:border-amber-400 hover:bg-amber-50 cursor-pointer";
            if (feedback !== null) {
              if (isCorrect) cls = "border-green-500 bg-green-50";
              else if (isSelected) cls = "border-red-500 bg-red-50";
              else cls = "border-gray-200 opacity-50";
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={feedback !== null}
                className={`flex items-center justify-center p-4 bg-white border-2 rounded-xl transition-all min-h-[80px] ${cls}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Inline feedback with points */}
        {feedback !== null && (
          <div className={`rounded-xl p-4 text-center border-2 ${
            feedback ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}>
            {feedback ? (
              <div className="space-y-1">
                <p className="text-green-700 font-black text-lg">Correct!</p>
                {pointsEarned > 0 && (
                  <p className="text-green-600 font-black text-4xl">+{pointsEarned} pts</p>
                )}
              </div>
            ) : (
              <p className="text-red-700 font-semibold">Not quite — the correct answer is highlighted in green above</p>
            )}
          </div>
        )}

        {/* Next button — only shown after answering */}
        {feedback !== null && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
          >
            {questionIndex + 1 < questions.length ? "Next Question →" : "See Results →"}
          </button>
        )}
      </div>
    </div>
  );
}
