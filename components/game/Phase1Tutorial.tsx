"use client";

import { useState } from "react";
import { useAudio } from "@/hooks/useAudio";
import { CAFE_ITEMS } from "@/data/vocabItems";

const TUTORIAL_ITEMS = ["coffee", "bread", "menu"];

interface Props {
  onComplete: (discoveredIds: string[], points: number) => void;
}

export default function Phase1Tutorial({ onComplete }: Props) {
  const [screen, setScreen] = useState<"welcome" | "tutorial" | "briefing">("welcome");
  const [step, setStep] = useState(0);
  const [clicked, setClicked] = useState<string[]>([]);
  const [labelVisible, setLabelVisible] = useState<string | null>(null);
  const { play } = useAudio();

  const tutorialItems = TUTORIAL_ITEMS.map((id) => CAFE_ITEMS.find((i) => i.id === id)!);
  const currentTutorialItem = tutorialItems[step];

  function handleTutorialClick(id: string) {
    if (clicked.includes(id) || id !== TUTORIAL_ITEMS[step]) return;
    const item = CAFE_ITEMS.find((i) => i.id === id)!;
    play(item.audioPath);
    setLabelVisible(id);
    setClicked((prev) => [...prev, id]);
    setTimeout(() => {
      setLabelVisible(null);
      if (step + 1 < TUTORIAL_ITEMS.length) {
        setStep((s) => s + 1);
      } else {
        setTimeout(() => setScreen("briefing"), 800);
      }
    }, 2000);
  }

  if (screen === "welcome") {
    const coffeeItem = CAFE_ITEMS.find((i) => i.id === "coffee");
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-6">
          {coffeeItem?.imagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coffeeItem.imagePath} alt="coffee" className="w-20 h-20 mx-auto object-contain" />
          ) : (
            <div className="text-6xl">☕</div>
          )}
          <h1 className="text-3xl font-bold text-amber-900">Welcome to Café Русский!</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            You&apos;re about to start your shift as a waiter at a Russian café. Learn Russian words by
            interacting with café items, memorising them, and fulfilling customer orders.
          </p>
          <button
            onClick={() => setScreen("tutorial")}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
          >
            Start Training →
          </button>
        </div>
      </div>
    );
  }

  if (screen === "tutorial") {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-xl font-bold text-amber-900 mb-1">Learning the Controls</h2>
            <p className="text-gray-500 text-sm">Step {Math.min(step + 1, 3)} of 3</p>
          </div>

          <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 text-amber-900 font-medium text-center text-lg">
            {step < TUTORIAL_ITEMS.length ? (
              <>Click on the glowing <strong>{currentTutorialItem.english}</strong> {currentTutorialItem.emoji}</>
            ) : (
              <>Great! You know how to interact with items!</>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {tutorialItems.map((item) => {
              const isTarget = item.id === TUTORIAL_ITEMS[step];
              const isDone = clicked.includes(item.id);
              const showing = labelVisible === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTutorialClick(item.id)}
                  disabled={isDone || !isTarget}
                  className={`relative flex flex-col items-center rounded-xl p-6 border-2 transition-all text-center
                    ${isDone ? "border-green-400 bg-green-50 opacity-80" : ""}
                    ${isTarget && !isDone ? "border-amber-400 bg-white shadow-lg animate-pulse cursor-pointer hover:scale-105" : ""}
                    ${!isTarget && !isDone ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed" : ""}`}
                >
                  {item.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imagePath} alt={item.english} className="w-16 h-16 object-contain" />
                  ) : (
                    <span className="text-5xl">{item.emoji}</span>
                  )}
                  {showing && (
                    <div className="mt-2 space-y-0.5 animate-fade-in">
                      <div className="text-lg font-bold text-amber-900">{item.russian}</div>
                      <div className="text-sm text-gray-500 italic">({item.transliteration})</div>
                      <div className="text-sm text-gray-600">{item.english}</div>
                      <div className="text-green-600 font-bold text-sm">+5 pts!</div>
                    </div>
                  )}
                  {isDone && !showing && (
                    <div className="mt-2">
                      <span className="text-green-600 font-bold">{item.russian}</span>
                      <span className="block text-green-500 text-xl">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Briefing screen
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-amber-900 text-center">Your Training Programme</h2>
        <div className="space-y-3">
          {[
            { num: 1, label: "Learn the controls", done: true },
            { num: 2, label: "Explore the café and discover items", done: false },
            { num: 3, label: "Test your memory", done: false },
            { num: 4, label: "Serve customers as a waiter", done: false },
            { num: 5, label: "Final recap & results", done: false },
          ].map((p) => (
            <div
              key={p.num}
              className={`flex items-center gap-3 p-3 rounded-lg border ${p.done ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm
                ${p.done ? "bg-green-500" : "bg-gray-300"}`}>
                {p.done ? "✓" : p.num}
              </span>
              <span className={`font-medium ${p.done ? "text-green-700" : "text-gray-600"}`}>
                Phase {p.num}: {p.label}
              </span>
              {p.done && <span className="ml-auto text-green-500 text-sm">You are here</span>}
            </div>
          ))}
        </div>
        <button
          onClick={() => onComplete(TUTORIAL_ITEMS, 15)}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
        >
          Begin Exploring →
        </button>
      </div>
    </div>
  );
}
