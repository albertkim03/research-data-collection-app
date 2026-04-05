"use client";

import { useEffect, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import type { OrderAttempt } from "@/types/game";
import SpeakingAvatar from "./SpeakingAvatar";

interface OrderDef {
  id: number;
  text: string;
  english: string;
  audioSequence: string[];
  expected: { itemId: string; quantity: number }[];
}

const ORDERS: OrderDef[] = [
  {
    id: 1,
    text: "Кофе, пожалуйста",
    english: "One coffee, please",
    audioSequence: ["/game-mp3/game-1/audio_coffee_001.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "coffee", quantity: 1 }],
  },
  {
    id: 2,
    text: "Чай, пожалуйста",
    english: "One tea, please",
    audioSequence: ["/game-mp3/game-1/audio_tea_002.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "tea", quantity: 1 }],
  },
  {
    id: 3,
    text: "Два кофе, пожалуйста",
    english: "Two coffees, please",
    audioSequence: ["/game-mp3/game-2/audio_two_021.mp3", "/game-mp3/game-1/audio_coffee_001.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "coffee", quantity: 2 }],
  },
  {
    id: 4,
    text: "Три хлеб, пожалуйста",
    english: "Three breads, please",
    audioSequence: ["/game-mp3/game-2/audio_three_022.mp3", "/game-mp3/game-1/audio_bread_003.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "bread", quantity: 3 }],
  },
  {
    id: 5,
    text: "Один суп и один хлеб",
    english: "One soup and one bread",
    audioSequence: ["/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_soup_004.mp3", "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_bread_003.mp3"],
    expected: [{ itemId: "soup", quantity: 1 }, { itemId: "bread", quantity: 1 }],
  },
  {
    id: 6,
    text: "Два чай и один торт",
    english: "Two teas and one cake",
    audioSequence: ["/game-mp3/game-2/audio_two_021.mp3", "/game-mp3/game-1/audio_tea_002.mp3", "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_cake_007.mp3"],
    expected: [{ itemId: "tea", quantity: 2 }, { itemId: "cake", quantity: 1 }],
  },
  {
    id: 7,
    text: "Один кофе, один сок, и один торт",
    english: "One coffee, one juice, and one cake",
    audioSequence: [
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_coffee_001.mp3",
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_juice_006.mp3",
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_cake_007.mp3",
    ],
    expected: [{ itemId: "coffee", quantity: 1 }, { itemId: "juice", quantity: 1 }, { itemId: "cake", quantity: 1 }],
  },
  {
    id: 8,
    text: "Здравствуйте! Два кофе, один суп, и один хлеб. И счёт, пожалуйста.",
    english: "Hello! Two coffees, one soup, and one bread. And the bill, please.",
    audioSequence: [
      "/game-mp3/game-3/audio_hello_030.mp3",
      "/game-mp3/game-2/audio_two_021.mp3", "/game-mp3/game-1/audio_coffee_001.mp3",
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_soup_004.mp3",
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_bread_003.mp3",
      "/game-mp3/game-1/audio_bill_010.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3",
    ],
    expected: [
      { itemId: "coffee", quantity: 2 },
      { itemId: "soup", quantity: 1 },
      { itemId: "bread", quantity: 1 },
      { itemId: "bill", quantity: 1 },
    ],
  },
];

interface TrayItem { itemId: string; quantity: number }

interface Props {
  onScoreGain: (pts: number) => void;
  onComplete: (results: OrderAttempt[]) => void;
}

export default function Phase4Roleplay({ onScoreGain, onComplete }: Props) {
  const [orderIndex, setOrderIndex] = useState(0);
  const [tray, setTray] = useState<TrayItem[]>([]);
  // feedback states: null = awaiting, "first-fail" = show retry, "correct"/"wrong" = final result
  const [feedback, setFeedback] = useState<null | "first-fail" | "correct" | "wrong">(null);
  const [replayUsed, setReplayUsed] = useState(false);
  const [orderStart, setOrderStart] = useState(Date.now());
  const [results, setResults] = useState<OrderAttempt[]>([]);
  const [betweenOrders, setBetweenOrders] = useState(false);

  const { playSequence, isPlaying } = useAudio();
  const order = ORDERS[orderIndex];

  useEffect(() => {
    setOrderStart(Date.now());
    setTray([]);
    setFeedback(null);
    setReplayUsed(false);
    const t = setTimeout(() => playSequence(order.audioSequence), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIndex]);

  function addToTray(itemId: string) {
    if (feedback !== null && feedback !== "first-fail") return;
    setTray((prev) => {
      const existing = prev.find((t) => t.itemId === itemId);
      if (existing) return prev.map((t) => t.itemId === itemId ? { ...t, quantity: t.quantity + 1 } : t);
      return [...prev, { itemId, quantity: 1 }];
    });
  }

  function adjustTray(itemId: string, delta: number) {
    if (feedback !== null && feedback !== "first-fail") return;
    setTray((prev) =>
      prev.map((t) => t.itemId === itemId ? { ...t, quantity: t.quantity + delta } : t)
        .filter((t) => t.quantity > 0)
    );
  }

  function isOrderCorrect(deliveredTray: TrayItem[]): boolean {
    const expected = order.expected;
    for (const exp of expected) {
      const del = deliveredTray.find((t) => t.itemId === exp.itemId);
      if (!del || del.quantity !== exp.quantity) return false;
    }
    for (const del of deliveredTray) {
      if (!expected.find((e) => e.itemId === del.itemId)) return false;
    }
    return true;
  }

  function calcPoints(deliveredTray: TrayItem[], isFirstAttempt: boolean): number {
    let pts = 0;
    for (const exp of order.expected) {
      const del = deliveredTray.find((t) => t.itemId === exp.itemId);
      if (del) {
        pts += 15; // correct item type
        if (del.quantity === exp.quantity) pts += 15; // correct quantity
      }
    }
    if (isOrderCorrect(deliveredTray) && isFirstAttempt) pts += 20; // first-attempt bonus
    return pts;
  }

  function handleDeliver() {
    const correct = isOrderCorrect(tray);

    if (!correct && feedback === null) {
      // First failed attempt — show the English translation and allow retry
      setFeedback("first-fail");
      return;
    }

    // Final delivery (either correct first try, or after retry)
    const isFirstAttempt = feedback === null;
    const earned = calcPoints(tray, isFirstAttempt);
    onScoreGain(earned);

    const attempt: OrderAttempt = {
      orderNumber: order.id,
      orderItems: order.expected,
      deliveredItems: tray,
      correct,
      responseTimeMs: Date.now() - orderStart,
      replayUsed,
      timestamp: Date.now(),
    };
    setResults((prev) => [...prev, attempt]);
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => setBetweenOrders(true), 1800);
  }

  function handleRetry() {
    setTray([]);
    setFeedback(null);
  }

  function handleNextOrder() {
    setBetweenOrders(false);
    if (orderIndex + 1 >= ORDERS.length) {
      onComplete(results);
    } else {
      setOrderIndex((i) => i + 1);
    }
  }

  // ── Between orders ──────────────────────────────────────
  if (betweenOrders) {
    return (
      <div className="min-h-[60vh] bg-amber-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</div>
          <p className="text-xl font-bold text-gray-800">
            {feedback === "correct" ? "Спасибо! Order delivered correctly!" : "Keep practising!"}
          </p>
          <p className="text-gray-500 text-sm">Order {order.id} of {ORDERS.length}</p>
          <button
            onClick={handleNextOrder}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
          >
            {orderIndex + 1 >= ORDERS.length ? "Finish Role-play →" : "Next Customer →"}
          </button>
        </div>
      </div>
    );
  }

  const isFirstFail = feedback === "first-fail";

  return (
    <div className="bg-amber-50 pb-6">
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-3">
        {/* Order header */}
        <div className="bg-white rounded-xl shadow px-4 py-2.5 flex items-center justify-between">
          <span className="font-semibold text-amber-900 text-sm">Order {order.id} / {ORDERS.length}</span>
          <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2 ml-4">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${(order.id / ORDERS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Customer speech bubble */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <SpeakingAvatar isSpeaking={isPlaying} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-none px-4 py-3">
                <p className="text-base font-semibold text-amber-900">{order.text}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => playSequence(order.audioSequence)}
                  disabled={isPlaying}
                  className="text-sm text-amber-700 hover:text-amber-900 font-medium border border-amber-300 rounded-lg px-3 py-1 hover:bg-amber-50 transition-colors"
                >
                  🔊 {isPlaying ? "Playing…" : "Play Order"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* First-fail hint: show English translation + retry */}
        {isFirstFail && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 space-y-2">
            <p className="font-bold text-yellow-800 text-sm">Not quite right! The order was:</p>
            <p className="text-yellow-900 text-base font-semibold italic">"{order.english}"</p>
            <p className="text-yellow-700 text-sm">Adjust your tray and try again — you have one more chance!</p>
            <button
              onClick={handleRetry}
              className="mt-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-sm transition-colors"
            >
              Try Again →
            </button>
          </div>
        )}

        {/* Correct feedback inline */}
        {(feedback === "correct" || feedback === "wrong") && (
          <div className={`rounded-xl p-3 text-center font-bold ${feedback === "correct" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {feedback === "correct" ? "✓ Order correct!" : "✗ Not quite — moving on"}
          </div>
        )}

        {/* Counter items */}
        <div className="bg-white rounded-xl shadow p-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Counter — click to add to tray</h3>
          <div className="grid grid-cols-6 gap-1.5">
            {CAFE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => addToTray(item.id)}
                disabled={(feedback !== null && !isFirstFail) || feedback === "first-fail" && false}
                className="flex flex-col items-center p-1.5 border border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs text-gray-500 mt-0.5 leading-tight">{item.english}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tray */}
        <div className="bg-white rounded-xl shadow p-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your Tray</h3>
          {tray.length === 0 ? (
            <p className="text-gray-400 text-center py-3 text-sm">Click items above to add them here</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {tray.map(({ itemId, quantity }) => {
                const item = CAFE_ITEMS.find((i) => i.id === itemId)!;
                const expItem = order.expected.find((e) => e.itemId === itemId);
                let borderClass = "border-gray-200";
                if (feedback === "correct" || feedback === "wrong") {
                  borderClass = expItem && expItem.quantity === quantity ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50";
                }
                return (
                  <div key={itemId} className={`flex items-center gap-1.5 border-2 rounded-xl px-2.5 py-1.5 ${borderClass}`}>
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm font-medium">{item.english}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustTray(itemId, -1)}
                        disabled={feedback !== null && !isFirstFail}
                        className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs"
                      >−</button>
                      <span className="w-5 text-center font-bold text-sm">{quantity}</span>
                      <button
                        onClick={() => adjustTray(itemId, 1)}
                        disabled={feedback !== null && !isFirstFail}
                        className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs"
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={handleDeliver}
            disabled={tray.length === 0 || (feedback !== null && !isFirstFail)}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            {isFirstFail ? "Deliver (Retry) ✓" : "Deliver Order ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
