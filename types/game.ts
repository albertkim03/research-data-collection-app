export interface VocabItem {
  id: string;
  russian: string;
  transliteration: string;
  english: string;
  audioPath: string;
  category: "noun" | "number" | "phrase";
  emoji: string;
  imagePath?: string; // pixel-art PNG, present for CAFE_ITEMS
}

export interface RecallAttempt {
  trialNumber: number;
  promptItemId: string;
  selectedItemId: string;
  correct: boolean;
  responseTimeMs: number;
  round: 1 | 2 | 3;
  timestamp: number;
}

export interface OrderAttempt {
  orderNumber: number;
  orderItems: { itemId: string; quantity: number }[];
  deliveredItems: { itemId: string; quantity: number }[];
  correct: boolean;
  responseTimeMs: number;
  replayUsed: boolean;
  timestamp: number;
}

export interface RecapAttempt {
  questionNumber: number;
  questionType: string;
  correct: boolean;
  responseTimeMs: number;
  timestamp: number;
}

export interface GameState {
  participantId: string;
  // 1=Tutorial 2=Explore 3=Recall 4=VocabLearn 5=PhraseGame 6=Roleplay 7=Recap 8=Results
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  score: number;
  startTime: number;
  phaseStartTime: number;
  discoveredItems: string[];
  recallResults: RecallAttempt[];
  orderResults: OrderAttempt[];
  recapResults: RecapAttempt[];
}

export interface SessionLog {
  participantId: string;
  condition: "desktop";
  sessionDate: string;
  totalScore: number;
  totalTimeMs: number;
  phases: {
    phase: number;
    startTime: number;
    endTime: number;
    score: number;
  }[];
  discoveredItems: string[];
  recallResults: RecallAttempt[];
  orderResults: OrderAttempt[];
  recapResults: RecapAttempt[];
}

export type GameAction =
  | { type: "SET_PARTICIPANT_ID"; id: string }
  | { type: "START_GAME" }
  | { type: "NEXT_PHASE" }
  | { type: "JUMP_TO_PHASE"; phase: GameState["phase"] }
  | { type: "DISCOVER_ITEM"; itemId: string }
  | { type: "ADD_SCORE"; points: number }
  | { type: "LOG_RECALL"; result: RecallAttempt }
  | { type: "LOG_ORDER"; result: OrderAttempt }
  | { type: "LOG_RECAP"; result: RecapAttempt }
  | { type: "RESET" };
