"use client";

import { useEffect, useReducer, useRef } from "react";
import type { GameAction, GameState, OrderAttempt, RecallAttempt, RecapAttempt } from "@/types/game";
import GameHeader from "./GameHeader";
import Phase1Tutorial from "./Phase1Tutorial";
import Phase2Explore from "./Phase2Explore";
import Phase3Recall from "./Phase3Recall";
import Phase4VocabLearn from "./Phase4VocabLearn";
import Phase4Roleplay from "./Phase4Roleplay";
import Phase5Recap from "./Phase5Recap";
import ResultsScreen from "./ResultsScreen";
import AdminControls, { SHOW_ADMIN_CONTROLS } from "./AdminControls";

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

  // Auto-start the game on mount (no participant ID entry needed)
  useEffect(() => {
    dispatch({ type: "START_GAME" });
    gameStartRef.current = Date.now();
  }, []);

  function handlePhase1Complete(discoveredIds: string[], points: number) {
    discoveredIds.forEach((id) => dispatch({ type: "DISCOVER_ITEM", itemId: id }));
    dispatch({ type: "ADD_SCORE", points });
    dispatch({ type: "NEXT_PHASE" });
  }

  function handlePhase2Complete(discovered: string[], pointsEarned: number) {
    discovered.forEach((id) => dispatch({ type: "DISCOVER_ITEM", itemId: id }));
    dispatch({ type: "ADD_SCORE", points: pointsEarned });
    dispatch({ type: "NEXT_PHASE" });
  }

  function handlePhase3Complete(results: RecallAttempt[], pointsEarned: number) {
    results.forEach((r) => dispatch({ type: "LOG_RECALL", result: r }));
    dispatch({ type: "ADD_SCORE", points: pointsEarned });
    dispatch({ type: "NEXT_PHASE" });
  }

  function handlePhase4VocabComplete() {
    // Pure learning phase — no points, just advance
    dispatch({ type: "NEXT_PHASE" });
  }

  function handlePhase5Complete(results: OrderAttempt[], pointsEarned: number) {
    results.forEach((r) => dispatch({ type: "LOG_ORDER", result: r }));
    dispatch({ type: "ADD_SCORE", points: pointsEarned });
    dispatch({ type: "NEXT_PHASE" });
  }

  function handlePhase6Complete(results: RecapAttempt[], pointsEarned: number) {
    results.forEach((r) => dispatch({ type: "LOG_RECAP", result: r }));
    dispatch({ type: "ADD_SCORE", points: pointsEarned });
    totalTimeRef.current = Date.now() - gameStartRef.current;
    dispatch({ type: "NEXT_PHASE" });
  }

  // Items missed in Phase 3 (for Phase 6 review board)
  const wrongItemIds = state.recallResults
    .filter((r) => !r.correct)
    .map((r) => r.promptItemId)
    .filter((id, i, arr) => arr.indexOf(id) === i);

  return (
    <div className="min-h-screen bg-amber-50">
      <GameHeader
        phase={state.phase}
        score={state.score}
        gameStarted={state.phase >= 1 && state.phase <= 6}
      />

      {state.phase === 1 && (
        <Phase1Tutorial onComplete={handlePhase1Complete} />
      )}
      {state.phase === 2 && (
        <Phase2Explore
          initialDiscovered={state.discoveredItems}
          onComplete={handlePhase2Complete}
        />
      )}
      {state.phase === 3 && (
        <Phase3Recall onComplete={handlePhase3Complete} />
      )}
      {state.phase === 4 && (
        <Phase4VocabLearn onComplete={handlePhase4VocabComplete} />
      )}
      {state.phase === 5 && (
        <Phase4Roleplay onComplete={handlePhase5Complete} />
      )}
      {state.phase === 6 && (
        <Phase5Recap
          wrongItemIds={wrongItemIds}
          recallResults={state.recallResults}
          onComplete={handlePhase6Complete}
        />
      )}
      {state.phase === 7 && (
        <ResultsScreen
          gameState={state}
          totalTimeMs={totalTimeRef.current}
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
