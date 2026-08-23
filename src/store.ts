import { create } from "zustand";

/**
 * Phase machine of the whole experience:
 * loading -> intro (envelope) -> party (3D room)
 * party -> approach (character walks in, prays)
 * approach -> closeup (zoom into candles, 1st "Thổi nến")
 * closeup -> blowing (2nd "Thổi nến", flames out) -> blown (banner)
 * blown -> relight (character relights, walks out) -> party
 */
export type Phase =
  | "loading"
  | "intro"
  | "party"
  | "approach"
  | "closeup"
  | "blowing"
  | "blown"
  | "relight";

interface PartyState {
  phase: Phase;
  charReady: boolean;      // character arrived & praying -> user may blow
  candlesLit: boolean;
  letterOpen: boolean;
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
  openLetter: () => void;
  closeLetter: () => void;
  fireBurst: () => void;
}

export const useParty = create<PartyState>((set, get) => ({
  phase: "loading",
  charReady: false,
  candlesLit: true,
  letterOpen: false,
  burst: 0,
  douse: 0,

  enterParty: () => set({ phase: "party", burst: get().burst + 1 }),

  startApproach: () => {
    if (get().phase !== "party") return;
    set({ phase: "approach", charReady: false, letterOpen: false });
  },

  onCharacterArrived: () => set({ charReady: true }),

  requestBlow: () => {
    const p = get().phase;
    if (p === "approach" && get().charReady) set({ phase: "closeup" });
    else if (p === "closeup") set({ phase: "blowing" });
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

  openLetter: () => set({ letterOpen: true }),
  closeLetter: () => set({ letterOpen: false }),

  fireBurst: () => set({ burst: get().burst + 1 }),
}));
