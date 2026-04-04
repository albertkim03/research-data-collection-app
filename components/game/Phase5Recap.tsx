"use client";

import React, { useEffect, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { shuffle } from "@/utils/shuffle";
import type { RecallAttempt, RecapAttempt } from "@/types/game";

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
  const { play, isPlaying } = useAudio();

  // 6 beginner-friendly questions — no Russian reading required
  // Q1: Audio → emoji/image
  // Q2: Hear phrase → pick English meaning
  // Q3: Audio sequence → tray combo
  // Q4: Audio → emoji/image
  // Q5: Hear phrase → pick English meaning
  // Q6: See item image → hear audio → pick English word
  const questions: RecapQuestion[] = [
    {
      id: 1,
      type: "audio-to-image",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Hear the word, then click the correct item</p>
          <button
            onClick={() => play("/game-mp3/game-1/audio_milk_008.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
          >
            🔊 {isPlaying ? "Playing…" : "Play word"}
          </button>
        </div>
      ),
      correctId: "milk",
      options: shuffle(["milk", "bread", "soup", "water", "sugar", "spoon"]).map((id) => ({
        id,
        label: (
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">{CAFE_ITEMS.find((i) => i.id === id)!.emoji}</span>
            <span className="text-xs text-gray-500">{CAFE_ITEMS.find((i) => i.id === id)!.english}</span>
          </div>
        ),
      })),
    },
    {
      id: 2,
      type: "audio-to-english-meaning",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to this Russian phrase — what does it mean?</p>
          <button
            onClick={() => play("/game-mp3/game-3/audio_thank_you_031.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
          >
            🔊 {isPlaying ? "Playing…" : "Play phrase"}
          </button>
        </div>
      ),
      correctId: "thank_you_en",
      options: shuffle([
        { id: "thank_you_en", label: <span className="text-lg font-bold">Thank you</span> },
        { id: "hello_en",     label: <span className="text-lg font-bold">Hello</span> },
        { id: "goodbye_en",   label: <span className="text-lg font-bold">Goodbye</span> },
        { id: "please_en",    label: <span className="text-lg font-bold">Please</span> },
      ]),
    },
    {
      id: 3,
      type: "order-reconstruction",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to the order, then select the correct tray</p>
          <button
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl hover:bg-amber-200 transition-colors"
            onClick={() => {
              play("/game-mp3/game-2/audio_one_020.mp3");
              setTimeout(() => play("/game-mp3/game-1/audio_coffee_001.mp3"), 900);
              setTimeout(() => play("/game-mp3/game-2/audio_two_021.mp3"), 1800);
              setTimeout(() => play("/game-mp3/game-1/audio_bread_003.mp3"), 2700);
            }}
          >
            🔊 Play order
          </button>
        </div>
      ),
      correctId: "1coffee2bread",
      options: shuffle([
        { id: "1coffee2bread", label: <div className="text-center"><div className="text-2xl">☕×1 + 🍞×2</div><div className="text-xs text-gray-500 mt-1">1 coffee + 2 bread</div></div> },
        { id: "2coffee1bread", label: <div className="text-center"><div className="text-2xl">☕×2 + 🍞×1</div><div className="text-xs text-gray-500 mt-1">2 coffee + 1 bread</div></div> },
        { id: "1soup2bread",   label: <div className="text-center"><div className="text-2xl">🍲×1 + 🍞×2</div><div className="text-xs text-gray-500 mt-1">1 soup + 2 bread</div></div> },
        { id: "1coffee1bread", label: <div className="text-center"><div className="text-2xl">☕×1 + 🍞×1</div><div className="text-xs text-gray-500 mt-1">1 coffee + 1 bread</div></div> },
      ]),
    },
    {
      id: 4,
      type: "audio-to-image",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Hear the word, then click the correct item</p>
          <button
            onClick={() => play("/game-mp3/game-1/audio_spoon_012.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
          >
            🔊 {isPlaying ? "Playing…" : "Play word"}
          </button>
        </div>
      ),
      correctId: "spoon",
      options: shuffle(["spoon", "menu", "bill", "sugar", "milk", "cake"]).map((id) => ({
        id,
        label: (
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">{CAFE_ITEMS.find((i) => i.id === id)!.emoji}</span>
            <span className="text-xs text-gray-500">{CAFE_ITEMS.find((i) => i.id === id)!.english}</span>
          </div>
        ),
      })),
    },
    {
      id: 5,
      type: "audio-to-english-meaning",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Listen to this Russian phrase — what does it mean?</p>
          <button
            onClick={() => play("/game-mp3/game-3/audio_goodbye_035.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors"
          >
            🔊 {isPlaying ? "Playing…" : "Play phrase"}
          </button>
        </div>
      ),
      correctId: "goodbye_en",
      options: shuffle([
        { id: "goodbye_en",   label: <span className="text-lg font-bold">Goodbye</span> },
        { id: "hello_en",     label: <span className="text-lg font-bold">Hello</span> },
        { id: "thank_you_en", label: <span className="text-lg font-bold">Thank you</span> },
        { id: "yes_en",       label: <span className="text-lg font-bold">Yes</span> },
      ]),
    },
    {
      id: 6,
      type: "image-audio-to-english",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">Look at this item and listen — what is it called in English?</p>
          <div className="text-6xl">🍰</div>
          <button
            onClick={() => play("/game-mp3/game-1/audio_cake_007.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-2 rounded-xl hover:bg-amber-200 transition-colors"
          >
            🔊 {isPlaying ? "Playing…" : "Hear it"}
          </button>
        </div>
      ),
      correctId: "cake_en",
      options: shuffle([
        { id: "cake_en",  label: <span className="text-lg font-bold">Cake</span> },
        { id: "bread_en", label: <span className="text-lg font-bold">Bread</span> },
        { id: "soup_en",  label: <span className="text-lg font-bold">Soup</span> },
        { id: "milk_en",  label: <span className="text-lg font-bold">Milk</span> },
      ]),
    },
  ];

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (subPhase === "quiz") {
      setQuestionStart(Date.now());
      setFeedback(null);
      setSelectedId(null);
    }
  }, [subPhase, questionIndex]);

  function handleAnswer(optionId: string) {
    if (feedback !== null) return;
    const responseTime = Date.now() - questionStart;
    const correct = optionId === currentQuestion.correctId;
    setSelectedId(optionId);
    setFeedback(correct);

    const basePoints = 25;
    const speedBonus = correct && responseTime < 3000 ? 10 : 0;
    if (correct) onScoreGain(basePoints + speedBonus, speedBonus > 0 ? "⚡ Fast!" : undefined);

    const attempt: RecapAttempt = {
      questionNumber: currentQuestion.id,
      questionType: currentQuestion.type,
      correct,
      responseTimeMs: responseTime,
      timestamp: Date.now(),
    };
    const newResults = [...results, attempt];
    setResults(newResults);

    setTimeout(() => {
      if (questionIndex + 1 < questions.length) {
        setQuestionIndex((i) => i + 1);
      } else {
        onComplete(newResults);
      }
    }, 1500);
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
                  <span className="text-4xl mb-1">{item.emoji}</span>
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

        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          {currentQuestion.render()}
        </div>

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
      </div>
    </div>
  );
}
