import { create } from "zustand";

/**
 * Phase machine:
 * loading -> intro (envelope + letter) -> party (3D room + scroll page)
 * party -> approach (character walks in & prays)
 * approach --[1 press "Thổi nến"]--> blowing (zoom in, inhale, blow, flames out)
 * blowing -> blown (banner with wish)
 * blown -> relight (character relights candles, walks away) -> party
 */
export type Phase =
  | "loading"
  | "intro"
  | "party"
  | "approach"
  | "blowing"
  | "blown"
  | "relight";

export const CEREMONY: Phase[] = ["approach", "blowing", "blown", "relight"];

interface PartyState {
  phase: Phase;
  charReady: boolean;      // character arrived & praying -> user may blow
  candlesLit: boolean;
  burst: number;           // increment => confetti cannon fires
  douse: number;           // increment => screen darkens briefly when flames die
  enterParty: () => void;
  startApproach: () => void;
  onCharacterArrived: () => void;
  requestBlow: () => void;
  onFlamesOut: () => void;
  onBannerShown: () => void;
  requestRelight: () => void;
  onCandlesRelit: () => void;
  finishRelight: () => void;
  fireBurst: () => void;
}

export const useParty = create<PartyState>((set, get) => ({
  phase: "loading",
  charReady: false,
  candlesLit: true,
  burst: 0,
  douse: 0,

  enterParty: () => set({ phase: "party", burst: get().burst + 1 }),

  startApproach: () => {
    if (get().phase !== "party") return;
    set({ phase: "approach", charReady: false });
  },

  onCharacterArrived: () => set({ charReady: true }),

  requestBlow: () => {
    const s = get();
    if (s.phase === "approach" && s.charReady) set({ phase: "blowing" });
  },

  onFlamesOut: () =>
    set({ candlesLit: false, douse: get().douse + 1, burst: get().burst + 1 }),

  onBannerShown: () => set({ phase: "blown" }),

  requestRelight: () => {
    if (get().phase !== "blown") return;
    set({ phase: "relight" });
  },

  onCandlesRelit: () => set({ candlesLit: true }),

  finishRelight: () => set({ phase: "party", charReady: false }),

  fireBurst: () => set({ burst: get().burst + 1 }),
}));
