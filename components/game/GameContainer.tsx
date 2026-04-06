"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { GameAction, GameState, OrderAttempt, RecallAttempt, RecapAttempt } from "@/types/game";
import GameHeader from "./GameHeader";
import Phase1Tutorial from "./Phase1Tutorial";
import Phase2Explore from "./Phase2Explore";
import Phase3Recall from "./Phase3Recall";
import Phase4VocabLearn from "./Phase4VocabLearn";
import Phase4PhraseGame from "./Phase4PhraseGame";
import Phase4Roleplay from "./Phase4Roleplay";
import Phase5Recap from "./Phase5Recap";
import ResultsScreen from "./ResultsScreen";
import AdminControls, { SHOW_ADMIN_CONTROLS } from "./AdminControls";
import FloatingPoints, { type PointGain } from "./FloatingPoints";
import PhaseIntroOverlay from "./PhaseIntroOverlay";

const initialState: GameState = {
  participantId: "",
  phase: 1,
  score: 0,
  startTime: 0,
  phaseStartTime: 0,
  discoveredItems: [],
  recallResults: [],
  orderResults: [],
  recapResults: [],
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PARTICIPANT_ID":
      return { ...state, participantId: action.id };
    case "START_GAME":
      return { ...state, startTime: Date.now(), phaseStartTime: Date.now() };
    case "NEXT_PHASE":
      return { ...state, phase: (state.phase + 1) as GameState["phase"], phaseStartTime: Date.now() };
    case "JUMP_TO_PHASE":
      return { ...state, phase: action.phase, phaseStartTime: Date.now() };
    case "DISCOVER_ITEM":
      if (state.discoveredItems.includes(action.itemId)) return state;
      return { ...state, discoveredItems: [...state.discoveredItems, action.itemId] };
    case "ADD_SCORE":
      return { ...state, score: state.score + action.points };
    case "LOG_RECALL":
      return { ...state, recallResults: [...state.recallResults, action.result] };
    case "LOG_ORDER":
      return { ...state, orderResults: [...state.orderResults, action.result] };
    case "LOG_RECAP":
      return { ...state, recapResults: [...state.recapResults, action.result] };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

export default function GameContainer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const gameStartRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);

  // Floating point gains
  const [floatingGains, setFloatingGains] = useState<PointGain[]>([]);

  // Phase intro overlay — shown on normal progression (not admin jumps)
  const [phaseIntroFor, setPhaseIntroFor] = useState<number | null>(null);

  function addScore(pts: number, label?: string) {
    if (pts <= 0) return;
    dispatch({ type: "ADD_SCORE", points: pts });
    const id = Date.now() + Math.random();
    setFloatingGains((prev) => [...prev, { id, pts, label }]);
    setTimeout(() => setFloatingGains((prev) => prev.filter((g) => g.id !== id)), 2000);
  }

  useEffect(() => {
    dispatch({ type: "START_GAME" });
    gameStartRef.current = Date.now();
  }, []);

  function handlePhase1Complete(discoveredIds: string[]) {
    discoveredIds.forEach((id) => dispatch({ type: "DISCOVER_ITEM", itemId: id }));
    // Score was already added per-click inside Phase1Tutorial
    dispatch({ type: "NEXT_PHASE" });
    setPhaseIntroFor(2);
  }

  function handlePhase2Complete(discovered: string[]) {
    discovered.forEach((id) => dispatch({ type: "DISCOVER_ITEM", itemId: id }));
    dispatch({ type: "NEXT_PHASE" });
    setPhaseIntroFor(3);
  }

  function handlePhase3Complete(results: RecallAttempt[]) {
    results.forEach((r) => dispatch({ type: "LOG_RECALL", result: r }));
    dispatch({ type: "NEXT_PHASE" });
    setPhaseIntroFor(4);
  }

  function handlePhase4VocabComplete() {
    dispatch({ type: "NEXT_PHASE" });
    setPhaseIntroFor(5);
  }

  function handlePhase5PhraseComplete() {
    dispatch({ type: "NEXT_PHASE" });
    setPhaseIntroFor(6);
  }

  function handlePhase6RoleplayComplete(results: OrderAttempt[]) {
    results.forEach((r) => dispatch({ type: "LOG_ORDER", result: r }));
    dispatch({ type: "NEXT_PHASE" });
    setPhaseIntroFor(7);
  }

  function handlePhase7RecapComplete(results: RecapAttempt[]) {
    results.forEach((r) => dispatch({ type: "LOG_RECAP", result: r }));
    totalTimeRef.current = Date.now() - gameStartRef.current;
    dispatch({ type: "NEXT_PHASE" });
  }

  const wrongItemIds = state.recallResults
    .filter((r) => !r.correct)
    .map((r) => r.promptItemId)
    .filter((id, i, arr) => arr.indexOf(id) === i);

  return (
    <div className="min-h-screen bg-amber-50">
      <GameHeader
        phase={state.phase}
        score={state.score}
        gameStarted={state.phase >= 1 && state.phase <= 7}
      />

      {state.phase === 1 && (
        <Phase1Tutorial onScoreGain={addScore} onComplete={handlePhase1Complete} />
      )}
      {state.phase === 2 && (
        <Phase2Explore
          initialDiscovered={state.discoveredItems}
          onScoreGain={addScore}
          onComplete={handlePhase2Complete}
        />
      )}
      {state.phase === 3 && (
        <Phase3Recall
          onScoreGain={addScore}
          onComplete={handlePhase3Complete}
        />
      )}
      {state.phase === 4 && (
        <Phase4VocabLearn onComplete={handlePhase4VocabComplete} />
      )}
      {state.phase === 5 && (
        <Phase4PhraseGame
          onScoreGain={addScore}
          onComplete={handlePhase5PhraseComplete}
        />
      )}
      {state.phase === 6 && (
        <Phase4Roleplay
          onScoreGain={addScore}
          onComplete={handlePhase6RoleplayComplete}
        />
      )}
      {state.phase === 7 && (
        <Phase5Recap
          wrongItemIds={wrongItemIds}
          recallResults={state.recallResults}
          onScoreGain={addScore}
          onComplete={handlePhase7RecapComplete}
        />
      )}
      {state.phase === 8 && (
        <ResultsScreen
          gameState={state}
          totalTimeMs={totalTimeRef.current}
        />
      )}

      <FloatingPoints gains={floatingGains} />

      {phaseIntroFor !== null && (
        <PhaseIntroOverlay
          phase={phaseIntroFor}
          onClose={() => setPhaseIntroFor(null)}
        />
      )}

      {SHOW_ADMIN_CONTROLS && (
        <AdminControls
          currentPhase={state.phase}
          onJumpToPhase={(phase) => dispatch({ type: "JUMP_TO_PHASE", phase })}
        />
      )}
    </div>
  );
}
