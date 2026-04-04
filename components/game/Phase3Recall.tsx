"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import { useCountdown } from "@/hooks/useTimer";
import { shuffle } from "@/utils/shuffle";
import type { RecallAttempt, VocabItem } from "@/types/game";

const ROUND_CONFIGS: { promptId: string; distractorIds: string[] }[][] = [
  [
    { promptId: "coffee", distractorIds: ["bread", "cake", "juice"] },
    { promptId: "bread",  distractorIds: ["tea", "water", "spoon"] },
    { promptId: "soup",   distractorIds: ["milk", "sugar", "menu"] },
    { promptId: "water",  distractorIds: ["bill", "coffee", "cake"] },
  ],
  [
    { promptId: "cake",  distractorIds: ["soup", "juice", "sugar", "spoon", "coffee"] },
    { promptId: "milk",  distractorIds: ["tea", "water", "bread", "bill", "menu"] },
    { promptId: "sugar", distractorIds: ["cake", "spoon", "juice", "soup", "milk"] },
    { promptId: "menu",  distractorIds: ["bill", "coffee", "bread", "water", "tea"] },
  ],
  [
    { promptId: "bill",  distractorIds: ["coffee", "tea", "bread", "soup", "water", "juice", "cake"] },
    { promptId: "spoon", distractorIds: ["milk", "menu", "sugar", "coffee", "tea", "bread", "water"] },
    { promptId: "tea",   distractorIds: ["juice", "cake", "milk", "soup", "sugar", "spoon", "bill"] },
    { promptId: "juice", distractorIds: ["coffee", "bread", "menu", "water", "cake", "sugar", "spoon"] },
  ],
];

const ROUND_POINTS = [20, 25, 30];
const SPEED_BONUS = 10;
const SPEED_THRESHOLD_MS = 3000;

interface Props {
  onScoreGain: (pts: number, label?: string) => void;
  onComplete: (results: RecallAttempt[]) => void;
}

type SubPhase = "study" | "recall";

// ── Flip card for study phase ─────────────────────────────────
function FlipCard({ item, onFlip }: { item: VocabItem; onFlip: (item: VocabItem) => void }) {
  const [flipped, setFlipped] = useState(false);

  function handleClick() {
    onFlip(item);
    if (!flipped) {
      setFlipped(true);
      setTimeout(() => setFlipped(false), 3000);
    }
  }

  return (
    <div onClick={handleClick} className="cursor-pointer select-none" style={{ perspective: "1000px" }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          height: "150px",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-white border-2 border-amber-200 rounded-xl hover:border-amber-400 p-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-4xl mb-1">{item.emoji}</span>
          <span className="text-sm font-semibold text-gray-700">{item.english}</span>
          <span className="text-xs text-gray-400 mt-2">🔊 Click to hear</span>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 border-2 border-amber-400 rounded-xl p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-3xl mb-1">{item.emoji}</span>
          <span className="text-xl font-bold text-amber-900">{item.russian}</span>
          <span className="text-sm text-gray-500 italic mt-1">({item.transliteration})</span>
        </div>
      </div>
    </div>
  );
}

export default function Phase3Recall({ onScoreGain, onComplete }: Props) {
  const [subPhase, setSubPhase] = useState<SubPhase>("study");
  const [round, setRound] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [options, setOptions] = useState<VocabItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [speedBonusFlash, setSpeedBonusFlash] = useState(false);
  const resultsRef = useRef<RecallAttempt[]>([]);
  const [results, setResults] = useState<RecallAttempt[]>([]);
  const [roundMessage, setRoundMessage] = useState<string | null>(null);
  const [betweenRounds, setBetweenRounds] = useState(false);

  const { play, isPlaying } = useAudio();
  const { remaining: studyRemaining } = useCountdown(90, subPhase === "study", () =>
    setSubPhase("recall")
  );

  const totalTrials = ROUND_CONFIGS.flat().length;
  const globalTrialNum = round * 4 + trialIndex + 1;
  const currentConfig = ROUND_CONFIGS[round]?.[trialIndex];
  const promptItem = currentConfig ? CAFE_ITEMS.find((i) => i.id === currentConfig.promptId)! : null;

  const setupTrial = useCallback((r: number, t: number) => {
    const config = ROUND_CONFIGS[r][t];
    const correct = CAFE_ITEMS.find((i) => i.id === config.promptId)!;
    const distractors = config.distractorIds.map((id) => CAFE_ITEMS.find((i) => i.id === id)!);
    setOptions(shuffle([correct, ...distractors]));
    setCorrectId(config.promptId);
    setFeedback(null);
    setSelectedId(null);
    setTrialStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (subPhase === "recall" && !betweenRounds) {
      setupTrial(round, trialIndex);
    }
  }, [subPhase, round, trialIndex, setupTrial, betweenRounds]);

  useEffect(() => {
    if (subPhase === "recall" && promptItem && feedback === null && !betweenRounds) {
      const t = setTimeout(() => play(promptItem.audioPath), 300);
      return () => clearTimeout(t);
    }
  }, [subPhase, promptItem, play, feedback, betweenRounds]);

  function handleAnswer(itemId: string) {
    if (feedback !== null || betweenRounds) return;
    const responseTime = Date.now() - trialStartTime;
    const correct = itemId === correctId;
    setSelectedId(itemId);
    setFeedback(correct ? "correct" : "wrong");

    const basePoints = ROUND_POINTS[round];
    const speedBonus = correct && round === 2 && responseTime < SPEED_THRESHOLD_MS ? SPEED_BONUS : 0;

    if (correct) {
      onScoreGain(basePoints);
      if (speedBonus > 0) {
        setSpeedBonusFlash(true);
        setTimeout(() => {
          onScoreGain(speedBonus, "⚡ Speed!");
          setSpeedBonusFlash(false);
        }, 600);
      }
    }

    const attempt: RecallAttempt = {
      trialNumber: globalTrialNum,
      promptItemId: currentConfig!.promptId,
      selectedItemId: itemId,
      correct,
      responseTimeMs: responseTime,
      round: (round + 1) as 1 | 2 | 3,
      timestamp: Date.now(),
    };
    resultsRef.current = [...resultsRef.current, attempt];
    setResults(resultsRef.current);

    setTimeout(() => advanceTrial(round, trialIndex), 1800);
  }

  function advanceTrial(currentRound: number, currentTrial: number) {
    const nextTrial = currentTrial + 1;
    if (nextTrial < ROUND_CONFIGS[currentRound].length) {
      setTrialIndex(nextTrial);
      setupTrial(currentRound, nextTrial);
    } else {
      const nextRound = currentRound + 1;
      const roundCorrect = resultsRef.current.filter((r) => r.round === currentRound + 1 && r.correct).length;
      let msg = "";
      if (currentRound === 0) msg = `Round 1 complete! ${roundCorrect}/4 correct. Ready for a bigger challenge?`;
      else if (currentRound === 1) msg = `Round 2 done! ${roundCorrect}/4 correct. Final round — can you beat the clock?`;
      else msg = "Memory Game complete! Great job!";
      setRoundMessage(msg);
      setBetweenRounds(true);
      if (nextRound >= ROUND_CONFIGS.length) {
        setTimeout(() => onComplete(resultsRef.current), 2500);
      }
    }
  }

  function handleContinueRound() {
    const nextRound = round + 1;
    setRound(nextRound);
    setTrialIndex(0);
    setBetweenRounds(false);
    setRoundMessage(null);
    setupTrial(nextRound, 0);
  }

  // ── Study Phase ───────────────────────────────────────────
  if (subPhase === "study") {
    const mins = Math.floor(studyRemaining / 60);
    const secs = studyRemaining % 60;
    return (
      <div className="bg-amber-50 pb-6">
        <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
          <div className="bg-white rounded-xl shadow px-6 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-amber-900">Phase 3: Memory Study</h2>
              <p className="text-gray-500 text-xs">Click a card to flip it and hear the pronunciation</p>
            </div>
            <div className="text-xl font-mono font-bold text-amber-700">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CAFE_ITEMS.map((item) => (
              <FlipCard key={item.id} item={item} onFlip={(i) => play(i.audioPath)} />
            ))}
          </div>
          <button
            onClick={() => setSubPhase("recall")}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
          >
            I&apos;m Ready → Start Memory Test
          </button>
        </div>
      </div>
    );
  }

  // ── Between rounds ────────────────────────────────────────
  if (betweenRounds && roundMessage) {
    const nextRound = round + 1;
    const isLast = nextRound >= ROUND_CONFIGS.length;
    return (
      <div className="min-h-[60vh] bg-amber-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="text-5xl">{isLast ? "🏆" : "✅"}</div>
          <p className="text-xl font-semibold text-gray-700">{roundMessage}</p>
          {!isLast && (
            <button
              onClick={handleContinueRound}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
            >
              {round === 1 ? "Final Round →" : `Round ${nextRound + 1} →`}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!promptItem || !currentConfig) return null;

  // ── Recall Trial ──────────────────────────────────────────
  return (
    <div className="bg-amber-50 pb-6">
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Progress header */}
        <div className="bg-white rounded-xl shadow px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Question {globalTrialNum} of {totalTrials}
            </span>
            <span className="text-sm text-amber-700">
              {round === 2 ? "⚡ Speed bonus if under 3 seconds!" : `${options.length} choices`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((globalTrialNum - 1) / totalTrials) * 100}%` }}
            />
          </div>
        </div>

        {/* Speed bonus flash */}
        {speedBonusFlash && (
          <div className="bg-yellow-400 text-yellow-900 text-center py-2 rounded-xl font-black text-lg animate-bounce">
            ⚡ Speed bonus! +{SPEED_BONUS} pts
          </div>
        )}

        {/* Audio prompt */}
        <div className="bg-white rounded-xl shadow p-5 text-center space-y-3">
          <p className="text-gray-500 text-sm">Which item is this?</p>
          <div className="text-4xl font-bold text-amber-900">{promptItem.russian}</div>
          <button
            onClick={() => play(promptItem.audioPath)}
            disabled={isPlaying}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            🔊 {isPlaying ? "Playing…" : "Play"}
          </button>
        </div>

        {/* Options grid */}
        <div className={`grid gap-3 ${options.length <= 4 ? "grid-cols-2" : options.length <= 6 ? "grid-cols-3" : "grid-cols-4"}`}>
          {options.map((item) => {
            const isSelected = selectedId === item.id;
            const isCorrect = item.id === correctId;
            let borderClass = "border-gray-200 hover:border-amber-400 hover:shadow-md cursor-pointer";
            if (feedback !== null) {
              if (isCorrect) borderClass = "border-green-500 bg-green-50";
              else if (isSelected) borderClass = "border-red-500 bg-red-50";
              else borderClass = "border-gray-200 opacity-50";
            }
            return (
              <button
                key={item.id}
                onClick={() => handleAnswer(item.id)}
                disabled={feedback !== null}
                className={`flex flex-col items-center p-4 bg-white border-2 rounded-xl transition-all ${borderClass}`}
              >
                <span className="text-4xl">{item.emoji}</span>
                <span className="text-xs text-gray-500 mt-1">{item.english}</span>
                {feedback !== null && (
                  <span className="text-sm mt-1 font-semibold text-gray-700">{item.russian}</span>
                )}
              </button>
            );
          })}
        </div>

        {feedback === "wrong" && correctId && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-700 font-semibold">
              The correct answer was{" "}
              <strong>{CAFE_ITEMS.find((i) => i.id === correctId)?.russian}</strong>
              {" "}({CAFE_ITEMS.find((i) => i.id === correctId)?.english})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
