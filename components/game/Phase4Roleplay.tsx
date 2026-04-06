"use client";

import { useEffect, useRef, useState } from "react";
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

// Counter slot positions: [left%, top%] within the counter image container
// 6 slots in 2 rows of 3 — positioned to look natural on the counter surface
const SLOT_POSITIONS: [number, number][] = [
  [20, 78], [40, 78], [60, 78], [80, 78],
];

interface CounterSlot {
  itemId: string | null;
  quantity: number;
}

interface Props {
  onScoreGain: (pts: number) => void;
  onComplete: (results: OrderAttempt[]) => void;
}

export default function Phase4Roleplay({ onScoreGain, onComplete }: Props) {
  const [orderIndex, setOrderIndex] = useState(0);
  const [slots, setSlots] = useState<CounterSlot[]>(
    Array(SLOT_POSITIONS.length).fill(null).map(() => ({ itemId: null, quantity: 0 }))
  );
  const [feedback, setFeedback] = useState<null | "first-fail" | "correct" | "wrong">(null);
  const [orderStart, setOrderStart] = useState(Date.now());
  const [results, setResults] = useState<OrderAttempt[]>([]);
  const [betweenOrders, setBetweenOrders] = useState(false);

  // Track drag source using a ref (avoids stale closure issues)
  const dragRef = useRef<
    | { type: "inventory"; itemId: string }
    | { type: "slot"; slotIndex: number }
    | null
  >(null);
  // Which slot is currently hovered during drag (for visual feedback)
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [isDraggingOverInventory, setIsDraggingOverInventory] = useState(false);

  const { playSequence, isPlaying } = useAudio();
  const order = ORDERS[orderIndex];

  useEffect(() => {
    setOrderStart(Date.now());
    setSlots(Array(SLOT_POSITIONS.length).fill(null).map(() => ({ itemId: null, quantity: 0 })));
    setFeedback(null);
    const t = setTimeout(() => playSequence(order.audioSequence), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIndex]);

  // ── Drop onto a counter slot ──────────────────────────────
  function handleDropOnSlot(slotIndex: number) {
    const src = dragRef.current;
    if (!src) return;
    setDragOverSlot(null);

    if (src.type === "inventory") {
      setSlots((prev) => {
        const newSlots = [...prev];
        const existingIdx = newSlots.findIndex((s) => s.itemId === src.itemId);
        if (existingIdx !== -1) {
          // Item already on counter — increment that slot's quantity
          newSlots[existingIdx] = { ...newSlots[existingIdx], quantity: newSlots[existingIdx].quantity + 1 };
        } else if (newSlots[slotIndex].itemId === null) {
          // Empty target slot — place here
          newSlots[slotIndex] = { itemId: src.itemId, quantity: 1 };
        } else {
          // Find next empty slot
          const emptyIdx = newSlots.findIndex((s) => s.itemId === null);
          if (emptyIdx !== -1) newSlots[emptyIdx] = { itemId: src.itemId, quantity: 1 };
        }
        return newSlots;
      });
    } else if (src.type === "slot" && src.slotIndex !== slotIndex) {
      // Swap two slots
      setSlots((prev) => {
        const newSlots = [...prev];
        [newSlots[slotIndex], newSlots[src.slotIndex]] = [newSlots[src.slotIndex], newSlots[slotIndex]];
        return newSlots;
      });
    }
    dragRef.current = null;
  }

  // ── Drop back on inventory = remove item ─────────────────
  function handleDropOnInventory() {
    const src = dragRef.current;
    if (src?.type === "slot") {
      setSlots((prev) => prev.map((s, i) => i === src.slotIndex ? { itemId: null, quantity: 0 } : s));
    }
    dragRef.current = null;
    setIsDraggingOverInventory(false);
  }

  function adjustQuantity(slotIndex: number, delta: number) {
    setSlots((prev) =>
      prev.map((s, i) => {
        if (i !== slotIndex) return s;
        const q = s.quantity + delta;
        return q <= 0 ? { itemId: null, quantity: 0 } : { ...s, quantity: q };
      })
    );
  }

  function clearSlot(slotIndex: number) {
    setSlots((prev) => prev.map((s, i) => i === slotIndex ? { itemId: null, quantity: 0 } : s));
  }

  function clearAll() {
    setSlots(Array(SLOT_POSITIONS.length).fill(null).map(() => ({ itemId: null, quantity: 0 })));
  }

  // ── Get tray as OrderAttempt-compatible array ─────────────
  function getTray() {
    return slots.filter((s) => s.itemId !== null).map((s) => ({ itemId: s.itemId!, quantity: s.quantity }));
  }

  function isOrderCorrect(tray: { itemId: string; quantity: number }[]): boolean {
    for (const exp of order.expected) {
      const del = tray.find((t) => t.itemId === exp.itemId);
      if (!del || del.quantity !== exp.quantity) return false;
    }
    for (const del of tray) {
      if (!order.expected.find((e) => e.itemId === del.itemId)) return false;
    }
    return true;
  }

  function calcPoints(tray: { itemId: string; quantity: number }[], isFirstAttempt: boolean): number {
    let pts = 0;
    for (const exp of order.expected) {
      const del = tray.find((t) => t.itemId === exp.itemId);
      if (del) {
        pts += 15;
        if (del.quantity === exp.quantity) pts += 15;
      }
    }
    if (isOrderCorrect(tray) && isFirstAttempt) pts += 20;
    return pts;
  }

  function handleDeliver() {
    const tray = getTray();
    const correct = isOrderCorrect(tray);

    if (!correct && feedback === null) {
      setFeedback("first-fail");
      return;
    }

    const isFirstAttempt = feedback === null;
    const earned = calcPoints(tray, isFirstAttempt);
    onScoreGain(earned);

    const attempt: OrderAttempt = {
      orderNumber: order.id,
      orderItems: order.expected,
      deliveredItems: tray,
      correct,
      responseTimeMs: Date.now() - orderStart,
      replayUsed: false,
      timestamp: Date.now(),
    };
    setResults((prev) => [...prev, attempt]);
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => setBetweenOrders(true), 1600);
  }

  function handleNextOrder() {
    setBetweenOrders(false);
    if (orderIndex + 1 >= ORDERS.length) {
      onComplete(results);
    } else {
      setOrderIndex((i) => i + 1);
    }
  }

  const canInteract = feedback === null || feedback === "first-fail";
  const tray = getTray();

  // ── Between orders screen ─────────────────────────────────
  if (betweenOrders) {
    return (
      <div className="min-h-[60vh] bg-amber-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</div>
          <p className="text-xl font-bold text-gray-800">
            {feedback === "correct" ? "Спасибо! Order delivered correctly!" : "Keep practising!"}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-0.5">The order was:</p>
            <p className="text-amber-900 font-semibold italic">"{order.english}"</p>
          </div>
          <p className="text-gray-400 text-xs">Order {order.id} of {ORDERS.length}</p>
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

  // ── Main game view ────────────────────────────────────────
  return (
    <div className="bg-amber-50 pb-6 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-3">

        {/* Order progress header */}
        <div className="bg-white rounded-xl shadow px-4 py-2.5 flex items-center gap-4">
          <span className="font-semibold text-amber-900 text-sm shrink-0">Order {order.id} / {ORDERS.length}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${(order.id / ORDERS.length) * 100}%` }} />
          </div>
        </div>

        {/* Main layout: inventory sidebar + counter area */}
        <div className="flex gap-3 items-stretch">

          {/* ── Inventory sidebar ── */}
          <div
            className={`w-36 bg-gray-900 rounded-xl border-2 flex flex-col overflow-hidden shrink-0 transition-all ${
              isDraggingOverInventory ? "border-red-400 bg-gray-800" : "border-gray-700"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOverInventory(true); }}
            onDragLeave={() => setIsDraggingOverInventory(false)}
            onDrop={handleDropOnInventory}
          >
            <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 shrink-0">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Inventory</p>
              <p className="text-gray-500 text-xs mt-0.5">Drag to counter</p>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              <div className="grid grid-cols-2 gap-1">
                {CAFE_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => { dragRef.current = { type: "inventory", itemId: item.id }; }}
                    onDragEnd={() => { dragRef.current = null; setDragOverSlot(null); }}
                    className="flex flex-col items-center gap-0.5 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-grab active:cursor-grabbing border border-gray-600 hover:border-amber-500 transition-all select-none"
                  >
                    {item.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imagePath} alt={item.english} className="w-10 h-10 object-contain pointer-events-none" draggable={false} />
                    ) : (
                      <span className="text-2xl pointer-events-none">{item.emoji}</span>
                    )}
                    <span className="text-gray-400 text-xs text-center leading-tight pointer-events-none">{item.english}</span>
                  </div>
                ))}
              </div>
            </div>
            {isDraggingOverInventory && (
              <div className="bg-red-900 bg-opacity-70 text-red-300 text-xs text-center py-2 font-bold border-t border-red-700">
                Drop to remove
              </div>
            )}
          </div>

          {/* ── Right panel: customer + counter ── */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Customer speech bubble */}
            <div className="bg-white rounded-xl shadow p-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <SpeakingAvatar isSpeaking={isPlaying} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-none px-4 py-3">
                    <p className="text-base font-semibold text-amber-900">{order.text}</p>
                  </div>
                  <button
                    onClick={() => playSequence(order.audioSequence)}
                    disabled={isPlaying}
                    className="mt-2 text-sm text-amber-700 hover:text-amber-900 font-medium border border-amber-300 rounded-lg px-3 py-1 hover:bg-amber-50 transition-colors"
                  >
                    🔊 {isPlaying ? "Playing…" : "Play Order"}
                  </button>
                </div>
              </div>
            </div>

            {/* First-fail hint */}
            {feedback === "first-fail" && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 space-y-1">
                <p className="font-bold text-yellow-800 text-sm">Not quite! The order was:</p>
                <p className="text-yellow-900 font-semibold italic">"{order.english}"</p>
                <p className="text-yellow-700 text-xs">Adjust the counter and try again — one more chance!</p>
              </div>
            )}

            {/* Final feedback inline */}
            {(feedback === "correct" || feedback === "wrong") && (
              <div className={`rounded-xl p-3 text-center font-bold ${feedback === "correct" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {feedback === "correct" ? "✓ Order correct!" : "✗ Not quite — moving on"}
              </div>
            )}

            {/* Counter with drag-and-drop */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-600">
              <div className="bg-gray-700 px-3 py-1.5 flex items-center justify-between">
                <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Counter</span>
                <button
                  onClick={clearAll}
                  disabled={!canInteract}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  Clear All ✕
                </button>
              </div>

              {/* Counter-top image with slots */}
              <div
                className="relative w-full"
                style={{ paddingTop: "34.6%" /* 1184/3422 = 0.346 */ }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pixel-arts/counter-top.png"
                  alt="café counter"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {/* Drop slots */}
                {SLOT_POSITIONS.map(([left, top], slotIndex) => {
                  const slot = slots[slotIndex];
                  const slotItem = slot.itemId ? CAFE_ITEMS.find((i) => i.id === slot.itemId) : null;
                  const isOver = dragOverSlot === slotIndex;

                  // Colour coding for slot feedback
                  let slotRing = "border-white border-opacity-20";
                  if (isOver) {
                    const dragging = dragRef.current;
                    if (dragging?.type === "inventory") {
                      slotRing = slot.itemId === dragging.itemId
                        ? "border-blue-400 border-opacity-90"   // stack
                        : slot.itemId === null
                          ? "border-green-400 border-opacity-90" // place
                          : "border-yellow-400 border-opacity-90"; // redirect to other slot
                    } else {
                      slotRing = "border-purple-400 border-opacity-90"; // slot swap
                    }
                  }
                  if (feedback === "correct" || feedback === "wrong") {
                    const exp = order.expected.find((e) => e.itemId === slot.itemId);
                    if (slot.itemId) {
                      slotRing = exp && exp.quantity === slot.quantity
                        ? "border-green-400 border-opacity-90"
                        : "border-red-400 border-opacity-90";
                    }
                  }

                  return (
                    <div
                      key={slotIndex}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16
                        rounded-xl border-2 transition-all duration-150 ${slotRing}
                        ${slot.itemId ? "bg-black bg-opacity-20" : "bg-black bg-opacity-10"}
                        ${isOver ? "scale-110" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotIndex); }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={() => { if (canInteract) handleDropOnSlot(slotIndex); }}
                    >
                      {slotItem ? (
                        <div
                          className="relative w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
                          draggable={canInteract}
                          onDragStart={() => { if (canInteract) dragRef.current = { type: "slot", slotIndex }; }}
                          onDragEnd={() => { dragRef.current = null; setDragOverSlot(null); }}
                        >
                          {slotItem.imagePath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slotItem.imagePath} alt={slotItem.english} className="w-10 h-10 object-contain pointer-events-none" draggable={false} />
                          ) : (
                            <span className="text-2xl pointer-events-none">{slotItem.emoji}</span>
                          )}

                          {/* Quantity badge */}
                          {slot.quantity > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                              {slot.quantity}
                            </span>
                          )}

                          {/* +/- controls */}
                          {canInteract && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); adjustQuantity(slotIndex, -1); }}
                                className="w-4 h-4 rounded bg-gray-700 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                              >−</button>
                              <button
                                onClick={(e) => { e.stopPropagation(); adjustQuantity(slotIndex, 1); }}
                                className="w-4 h-4 rounded bg-gray-700 text-white text-xs flex items-center justify-center hover:bg-green-600 transition-colors"
                              >+</button>
                            </div>
                          )}

                          {/* Remove X */}
                          {canInteract && (
                            <button
                              onClick={() => clearSlot(slotIndex)}
                              className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors opacity-70 hover:opacity-100"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Empty slot */
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-8 h-8 border border-dashed border-white border-opacity-30 rounded-lg" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quantity adjust row for placed items (more accessible than hover) */}
              {canInteract && tray.length > 0 && (
                <div className="px-3 py-2 flex flex-wrap gap-2 border-t border-gray-700">
                  {tray.map(({ itemId, quantity }) => {
                    const item = CAFE_ITEMS.find((i) => i.id === itemId)!;
                    const slotIdx = slots.findIndex((s) => s.itemId === itemId);
                    return (
                      <div key={itemId} className="flex items-center gap-1.5 bg-gray-700 rounded-lg px-2 py-1">
                        {item.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imagePath} alt={item.english} className="w-5 h-5 object-contain" />
                        ) : (
                          <span className="text-sm">{item.emoji}</span>
                        )}
                        <span className="text-gray-300 text-xs">{item.english}</span>
                        <button onClick={() => adjustQuantity(slotIdx, -1)} className="w-5 h-5 rounded bg-gray-600 text-white text-xs hover:bg-red-600 transition-colors">−</button>
                        <span className="text-white font-bold text-xs w-3 text-center">{quantity}</span>
                        <button onClick={() => adjustQuantity(slotIdx, 1)} className="w-5 h-5 rounded bg-gray-600 text-white text-xs hover:bg-green-600 transition-colors">+</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deliver button */}
            <button
              onClick={handleDeliver}
              disabled={tray.length === 0 || !canInteract}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg"
            >
              {feedback === "first-fail" ? "Deliver (Retry) ✓" : "Deliver Order ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
