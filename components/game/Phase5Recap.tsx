"use client";

import React, { useEffect, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { shuffle } from "@/utils/shuffle";
import type { RecallAttempt, RecapAttempt } from "@/types/game";

// Questions per spec
interface RecapQuestion {
  id: number;
  type: string;
  render: () => React.ReactNode;
  correctId: string;
  options: { id: string; label: React.ReactNode }[];
}

interface Props {
  wrongItemIds: string[]; // items missed in Phase 3
  recallResults: RecallAttempt[];
  onComplete: (results: RecapAttempt[], pointsEarned: number) => void;
}

type SubPhase = "review" | "quiz";

export default function Phase5Recap({ wrongItemIds, onComplete }: Props) {
  const [subPhase, setSubPhase] = useState<SubPhase>("review");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [questionStart, setQuestionStart] = useState(0);
  const [results, setResults] = useState<RecapAttempt[]>([]);
  const [points, setPoints] = useState(0);
  const { play, isPlaying } = useAudio();

  // Build the 6 fixed questions
  const questions: RecapQuestion[] = [
    {
      id: 1,
      type: "audio-to-image",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500">Hear the word, then click the correct item</p>
          <button onClick={() => play("/game-mp3/game-1/audio_milk_008.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors">
            🔊 {isPlaying ? "Playing…" : "Play word"}
          </button>
        </div>
      ),
      correctId: "milk",
      options: shuffle(["milk", "bread", "soup", "water", "sugar", "spoon"])
        .map((id) => ({ id, label: <span className="text-4xl">{CAFE_ITEMS.find((i) => i.id === id)!.emoji}</span> })),
    },
    {
      id: 2,
      type: "english-to-russian-text",
      render: () => (
        <div className="text-center">
          <p className="text-gray-500 mb-2">Select the Russian translation</p>
          <div className="text-3xl font-bold text-gray-800">"Thank you"</div>
        </div>
      ),
      correctId: "thank_you",
      options: shuffle([
        { id: "thank_you", label: <span className="text-xl font-bold">Спасибо</span> },
        { id: "hello",     label: <span className="text-xl font-bold">Здравствуйте</span> },
        { id: "goodbye",   label: <span className="text-xl font-bold">До свидания</span> },
        { id: "please",    label: <span className="text-xl font-bold">Пожалуйста</span> },
      ]),
    },
    {
      id: 3,
      type: "order-reconstruction",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500">Listen to the order, then select the correct tray</p>
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
        { id: "1coffee2bread", label: <span>☕×1 + 🍞×2</span> },
        { id: "2coffee1bread", label: <span>☕×2 + 🍞×1</span> },
        { id: "1soup2bread",   label: <span>🍲×1 + 🍞×2</span> },
        { id: "1coffee1bread", label: <span>☕×1 + 🍞×1</span> },
      ]),
    },
    {
      id: 4,
      type: "audio-to-image",
      render: () => (
        <div className="text-center space-y-3">
          <p className="text-gray-500">Hear the word, then click the correct item</p>
          <button onClick={() => play("/game-mp3/game-1/audio_spoon_012.mp3")}
            className="bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-xl text-lg hover:bg-amber-200 transition-colors">
            🔊 {isPlaying ? "Playing…" : "Play word"}
          </button>
        </div>
      ),
      correctId: "spoon",
      options: shuffle(["spoon", "menu", "bill", "sugar", "milk", "cake"])
        .map((id) => ({ id, label: <span className="text-4xl">{CAFE_ITEMS.find((i) => i.id === id)!.emoji}</span> })),
    },
    {
      id: 5,
      type: "english-to-russian-text",
      render: () => (
        <div className="text-center">
          <p className="text-gray-500 mb-2">Select the Russian translation</p>
          <div className="text-3xl font-bold text-gray-800">"Goodbye"</div>
        </div>
      ),
      correctId: "goodbye",
      options: shuffle([
        { id: "goodbye",   label: <span className="text-xl font-bold">До свидания</span> },
        { id: "hello",     label: <span className="text-xl font-bold">Здравствуйте</span> },
        { id: "thank_you", label: <span className="text-xl font-bold">Спасибо</span> },
        { id: "yes",       label: <span className="text-xl font-bold">Да</span> },
      ]),
    },
    {
      id: 6,
      type: "image-to-russian-text",
      render: () => (
        <div className="text-center">
          <p className="text-gray-500 mb-2">What is the Russian word for this?</p>
          <div className="text-6xl">🍰</div>
        </div>
      ),
      correctId: "cake",
      options: shuffle([
        { id: "cake",  label: <span className="text-xl font-bold">торт</span> },
        { id: "bread", label: <span className="text-xl font-bold">хлеб</span> },
        { id: "soup",  label: <span className="text-xl font-bold">суп</span> },
        { id: "milk",  label: <span className="text-xl font-bold">молоко</span> },
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
    setPoints((p) => p + (correct ? basePoints + speedBonus : 0));

    const attempt: RecapAttempt = {
      questionNumber: currentQuestion.id,
      questionType: currentQuestion.type,
      correct,
      responseTimeMs: responseTime,
      timestamp: Date.now(),
    };
    setResults((prev) => [...prev, attempt]);

    setTimeout(() => {
      if (questionIndex + 1 < questions.length) {
        setQuestionIndex((i) => i + 1);
      } else {
        onComplete(results.concat(attempt), points + (correct ? basePoints + speedBonus : 0));
      }
    }, 1500);
  }

  // ── Review Board ─────────────────────────────────────────
  if (subPhase === "review") {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-white rounded-xl shadow px-6 py-4">
            <h2 className="text-xl font-bold text-amber-900">Phase 5: Review Board</h2>
            <p className="text-gray-500 text-sm mt-1">
              Click any item to hear its pronunciation. Items you missed are highlighted.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {CAFE_ITEMS.map((item) => {
              const missed = wrongItemIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => play(item.audioPath)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                    ${missed ? "border-red-400 bg-red-50 animate-pulse" : "border-amber-200 bg-white hover:border-amber-400"}`}
                >
                  <span className="text-4xl mb-1">{item.emoji}</span>
                  <span className="text-base font-bold text-amber-900">{item.russian}</span>
                  <span className="text-xs text-gray-500 italic">{item.transliteration}</span>
                  <span className="text-xs text-gray-400">{item.english}</span>
                  {missed && <span className="text-xs text-red-500 font-bold mt-1">Review!</span>}
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
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-xl shadow px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Question {questionIndex + 1} / {questions.length}</span>
          <span className="text-sm font-semibold text-amber-700">+25 pts · speed bonus if &lt;3s</span>
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
