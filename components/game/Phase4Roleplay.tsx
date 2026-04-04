"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAFE_ITEMS } from "@/data/vocabItems";
import { useAudio } from "@/hooks/useAudio";
import type { OrderAttempt, VocabItem } from "@/types/game";

interface OrderDef {
  id: number;
  text: string;
  audioSequence: string[];
  expected: { itemId: string; quantity: number }[];
  timeLimit: number;
}

const ORDERS: OrderDef[] = [
  {
    id: 1,
    text: "Кофе, пожалуйста",
    audioSequence: ["/game-mp3/game-1/audio_coffee_001.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "coffee", quantity: 1 }],
    timeLimit: 20,
  },
  {
    id: 2,
    text: "Чай, пожалуйста",
    audioSequence: ["/game-mp3/game-1/audio_tea_002.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "tea", quantity: 1 }],
    timeLimit: 20,
  },
  {
    id: 3,
    text: "Два кофе, пожалуйста",
    audioSequence: ["/game-mp3/game-2/audio_two_021.mp3", "/game-mp3/game-1/audio_coffee_001.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "coffee", quantity: 2 }],
    timeLimit: 25,
  },
  {
    id: 4,
    text: "Три хлеб, пожалуйста",
    audioSequence: ["/game-mp3/game-2/audio_three_022.mp3", "/game-mp3/game-1/audio_bread_003.mp3", "/game-mp3/game-3/audio_youre_welcome_032.mp3"],
    expected: [{ itemId: "bread", quantity: 3 }],
    timeLimit: 25,
  },
  {
    id: 5,
    text: "Один суп и один хлеб",
    audioSequence: ["/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_soup_004.mp3", "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_bread_003.mp3"],
    expected: [{ itemId: "soup", quantity: 1 }, { itemId: "bread", quantity: 1 }],
    timeLimit: 35,
  },
  {
    id: 6,
    text: "Два чай и один торт",
    audioSequence: ["/game-mp3/game-2/audio_two_021.mp3", "/game-mp3/game-1/audio_tea_002.mp3", "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_cake_007.mp3"],
    expected: [{ itemId: "tea", quantity: 2 }, { itemId: "cake", quantity: 1 }],
    timeLimit: 35,
  },
  {
    id: 7,
    text: "Один кофе, один сок, и один торт",
    audioSequence: [
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_coffee_001.mp3",
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_juice_006.mp3",
      "/game-mp3/game-2/audio_one_020.mp3", "/game-mp3/game-1/audio_cake_007.mp3",
    ],
    expected: [{ itemId: "coffee", quantity: 1 }, { itemId: "juice", quantity: 1 }, { itemId: "cake", quantity: 1 }],
    timeLimit: 35,
  },
  {
    id: 8,
    text: "Здравствуйте! Два кофе, один суп, и один хлеб. И счёт, пожалуйста.",
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
    timeLimit: 50,
  },
];

interface TrayItem { itemId: string; quantity: number }

interface Props {
  onComplete: (results: OrderAttempt[], pointsEarned: number) => void;
}

export default function Phase4Roleplay({ onComplete }: Props) {
  const [orderIndex, setOrderIndex] = useState(0);
  const [tray, setTray] = useState<TrayItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "partial" | "wrong" | null>(null);
  const [replayUsed, setReplayUsed] = useState(false);
  const [orderStart, setOrderStart] = useState(Date.now());
  const [results, setResults] = useState<OrderAttempt[]>([]);
  const [points, setPoints] = useState(0);
  const [retryAllowed, setRetryAllowed] = useState(true);
  const [betweenOrders, setBetweenOrders] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { playSequence, isPlaying } = useAudio();

  const order = ORDERS[orderIndex];

  const startTimer = useCallback((limit: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    setOrderStart(Date.now());
    setTray([]);
    setFeedback(null);
    setReplayUsed(false);
    setRetryAllowed(true);
    startTimer(order.timeLimit);
    const t = setTimeout(() => {
      playSequence(order.audioSequence);
    }, 500);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIndex]);

  function addToTray(itemId: string) {
    if (feedback !== null) return;
    setTray((prev) => {
      const existing = prev.find((t) => t.itemId === itemId);
      if (existing) {
        return prev.map((t) => t.itemId === itemId ? { ...t, quantity: t.quantity + 1 } : t);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  }

  function adjustTray(itemId: string, delta: number) {
    setTray((prev) => {
      const updated = prev.map((t) => t.itemId === itemId ? { ...t, quantity: t.quantity + delta } : t)
        .filter((t) => t.quantity > 0);
      return updated;
    });
  }

  function validateOrder(deliveredTray: TrayItem[]): "correct" | "partial" | "wrong" {
    const expected = order.expected;
    let allCorrect = true;
    let anyCorrect = false;

    for (const exp of expected) {
      const delivered = deliveredTray.find((t) => t.itemId === exp.itemId);
      if (delivered && delivered.quantity === exp.quantity) {
        anyCorrect = true;
      } else {
        allCorrect = false;
      }
    }
    // Extra items in tray
    for (const del of deliveredTray) {
      if (!expected.find((e) => e.itemId === del.itemId)) {
        allCorrect = false;
      }
    }
    if (allCorrect) return "correct";
    if (anyCorrect) return "partial";
    return "wrong";
  }

  function handleDeliver(isRetry = false) {
    if (timerRef.current) clearInterval(timerRef.current);
    const responseTime = Date.now() - orderStart;
    const result = validateOrder(tray);
    setFeedback(result);

    let earned = 0;
    if (result === "correct") {
      // +20 per correct item
      for (const exp of order.expected) {
        earned += 20;
      }
      // +30 bonus for first-attempt correct
      if (!isRetry) earned += 30;
      // -5 if replay used
      if (replayUsed) earned -= 5;
      // +15 speed bonus
      if (responseTime < order.timeLimit * 1000) earned += 15;
    } else if (result === "partial" && !isRetry) {
      // Allow retry
      setRetryAllowed(true);
      return;
    } else {
      // Wrong items penalty
      for (const del of tray) {
        if (!order.expected.find((e) => e.itemId === del.itemId && e.quantity === del.quantity)) {
          earned -= 10;
        }
      }
    }

    setPoints((p) => Math.max(0, p + earned));

    const attempt: OrderAttempt = {
      orderNumber: order.id,
      orderItems: order.expected,
      deliveredItems: tray,
      correct: result === "correct",
      responseTimeMs: responseTime,
      replayUsed,
      timestamp: Date.now(),
    };
    setResults((prev) => [...prev, attempt]);

    setTimeout(() => {
      setBetweenOrders(true);
    }, 2000);
  }

  function handleRetry() {
    setFeedback(null);
    setTray([]);
    setRetryAllowed(false);
    setOrderStart(Date.now());
    startTimer(order.timeLimit);
  }

  function handleNextOrder() {
    setBetweenOrders(false);
    if (orderIndex + 1 >= ORDERS.length) {
      onComplete(results, points);
    } else {
      setOrderIndex((i) => i + 1);
    }
  }

  function handleReplay() {
    setReplayUsed(true);
    playSequence(order.audioSequence);
  }

  // ── Between orders ─────────────────────────────────────
  if (betweenOrders) {
    const lastResult = feedback;
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="text-5xl">{lastResult === "correct" ? "✅" : "❌"}</div>
          <p className="text-xl font-bold text-gray-800">
            {lastResult === "correct"
              ? "Спасибо! Order delivered correctly!"
              : "Нет, это не то... Try again next time."}
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

  const isPartialWrong = feedback === "partial" && retryAllowed;

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Order header */}
        <div className="bg-white rounded-xl shadow px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-amber-900">Order {order.id} / {ORDERS.length}</span>
          <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? "text-red-600" : "text-gray-700"}`}>
            ⏱ {timeLeft}s
          </span>
        </div>

        {/* Customer speech bubble */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div className="flex-1">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-none px-4 py-3">
                <p className="text-lg font-semibold text-amber-900">{order.text}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => playSequence(order.audioSequence)}
                  disabled={isPlaying}
                  className="text-sm text-amber-700 hover:text-amber-900 font-medium border border-amber-300 rounded-lg px-3 py-1 hover:bg-amber-50 transition-colors"
                >
                  🔊 {isPlaying ? "Playing…" : "Play Order"}
                </button>
                {!replayUsed && (
                  <button
                    onClick={handleReplay}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Replay (−5 pts)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Partial feedback warning */}
        {isPartialWrong && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-center">
            <p className="text-yellow-800 font-semibold">Not quite right! Try adjusting your tray.</p>
            <button
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
            >
              Retry Order
            </button>
          </div>
        )}

        {/* Counter items */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">COUNTER — Click to add to tray</h3>
          <div className="grid grid-cols-6 gap-2">
            {CAFE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => addToTray(item.id)}
                disabled={feedback !== null && !isPartialWrong}
                className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs text-gray-500 mt-0.5">{item.english}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tray */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">YOUR TRAY</h3>
          {tray.length === 0 ? (
            <p className="text-gray-400 text-center py-4 text-sm">Click items above to add them to your tray</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {tray.map(({ itemId, quantity }) => {
                const item = CAFE_ITEMS.find((i) => i.id === itemId)!;
                const expItem = order.expected.find((e) => e.itemId === itemId);
                let borderClass = "border-gray-200";
                if (feedback !== null && feedback !== "partial") {
                  borderClass = expItem && expItem.quantity === quantity
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50";
                }
                return (
                  <div
                    key={itemId}
                    className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2 ${borderClass}`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm font-medium">{item.english}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustTray(itemId, -1)}
                        disabled={feedback !== null && !isPartialWrong}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold">{quantity}</span>
                      <button
                        onClick={() => adjustTray(itemId, 1)}
                        disabled={feedback !== null && !isPartialWrong}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => handleDeliver(false)}
            disabled={tray.length === 0 || (feedback !== null && !isPartialWrong)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            Deliver Order ✓
          </button>
        </div>
      </div>
    </div>
  );
}
