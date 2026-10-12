import { create } from "zustand";

/**
 * Phase machine:
 * loading -> intro (envelope + letter) -> party (3D room + scroll page)
 * party --[click the cake]--> approach (character walks in & prays)
 * approach --[click the cake]--> blowing (zoom in, inhale, blow, flames out)
 * blowing -> blown (banner with wish)
 * blown --[click the cake]--> relight (character relights candles, walks away) -> party
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
  enteredAt: number | null; // performance.now() when the party doors opened (drives entrance animation)
  cakeHover: boolean;      // pointer is over the cake (pointer devices only)
  scrolled: boolean;       // the page has been scrolled away from the 3D hero
  heroGone: boolean;       // the hero is completely off screen → the 3D scene stops rendering
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
  setCakeHover: (v: boolean) => void;
  setScrolled: (v: boolean) => void;
  setHeroGone: (v: boolean) => void;
}

export const useParty = create<PartyState>((set, get) => ({
  phase: "loading",
  charReady: false,
  candlesLit: true,
  burst: 0,
  douse: 0,
  enteredAt: null,
  cakeHover: false,
  scrolled: false,
  heroGone: false,

  enterParty: () => {
    if (get().phase !== "intro") return;
    set({ phase: "party", burst: get().burst + 1, enteredAt: performance.now() });
  },

  startApproach: () => {
    if (get().phase !== "party") return;
    set({ phase: "approach", charReady: false, cakeHover: false });
  },

  onCharacterArrived: () => set({ charReady: true }),

  requestBlow: () => {
    const s = get();
    if (s.phase === "approach" && s.charReady) set({ phase: "blowing", cakeHover: false });
  },

  onFlamesOut: () =>
    set({ candlesLit: false, douse: get().douse + 1, burst: get().burst + 1 }),

  onBannerShown: () => set({ phase: "blown" }),

  requestRelight: () => {
    if (get().phase !== "blown") return;
    set({ phase: "relight", cakeHover: false });
  },

  onCandlesRelit: () => set({ candlesLit: true }),

  finishRelight: () => set({ phase: "party", charReady: false }),

  fireBurst: () => set({ burst: get().burst + 1 }),

  setCakeHover: (v) => {
    if (get().cakeHover !== v) set({ cakeHover: v });
  },

  setScrolled: (v) => {
    if (get().scrolled !== v) set({ scrolled: v });
  },

  setHeroGone: (v) => {
    if (get().heroGone !== v) set({ heroGone: v });
  },
}));

/* Handy for testing / poking around:  open the page with ?debug and use window.__party */
if (import.meta.env.DEV || new URLSearchParams(window.location.search).has("debug")) {
  (window as unknown as { __party: typeof useParty }).__party = useParty;
}
