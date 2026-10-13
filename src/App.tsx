import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Canvas } from "@react-three/fiber";
import { DEFAULT_CONFIG, makeT } from "./config";
import { useLiveConfig } from "./useLiveConfig";
import { useParty, CEREMONY } from "./store";
import { dom, DEBUG } from "./dom";
import { Experience } from "./scene/Experience";
import { scrollState } from "./scene/CameraRig";
import { Effects, PerfGuard } from "./scene/Effects";
import { PROFILES, useQuality } from "./scene/quality";
import { Envelope } from "./ui/Envelope";
import { Hud } from "./ui/Hud";
import { ScrollSections } from "./ui/ScrollSections";
import { HeartIcon } from "./ui/icons";

/** Wait (max 3 s) for the display fonts so text painted onto canvas textures is crisp. */
function fontsReady(): Promise<unknown> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return Promise.resolve();
  const loaded = Promise.all([
    fonts.load("800 74px 'Baloo 2'"),
    fonts.load("italic 600 34px 'Be Vietnam Pro'"),
    fonts.ready,
  ]).catch(() => undefined);
  return Promise.race([loaded, new Promise((r) => window.setTimeout(r, 3000))]);
}

export default function App() {
  const { config, error } = useLiveConfig();
  const phase = useParty((s) => s.phase);
  const enteredAt = useParty((s) => s.enteredAt);
  const heroGone = useParty((s) => s.heroGone);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [revealDone, setRevealDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tier = useQuality((s) => s.tier);
  const profile = PROFILES[tier];
  const qualityPref = config?.scene.quality;

  /* quality: ?q= in the URL wins, then "scene.quality" in config.json, then auto-detection */
  useEffect(() => {
    if (qualityPref) useQuality.getState().applyPref(qualityPref);
  }, [qualityPref]);

  /* the root element is the event source for the 3D scene (see <Canvas eventSource>) */
  useEffect(() => {
    dom.root = root;
    return () => {
      dom.root = null;
    };
  }, [root]);

  /* boot: first config + fonts → envelope screen */
  useEffect(() => {
    if (!config || phase !== "loading") return;
    let alive = true;
    fontsReady().then(() => {
      if (alive) useParty.setState({ phase: "intro" });
    });
    return () => {
      alive = false;
    };
  }, [config, phase]);

  /* browser tab title follows config.json too */
  useEffect(() => {
    if (config) document.title = makeT(config)("pageTitle");
  }, [config]);

  /* ceremony: hide every piece of main content until the candles are relit */
  const inCeremony = CEREMONY.includes(phase);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (inCeremony) {
      el.scrollTo({ top: 0, behavior: "smooth" });
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = "";
    }
  }, [inCeremony]);

  const loadingText = useMemo(
    () => (config ? makeT(config)("loading") : DEFAULT_CONFIG.ui.loading),
    [config]
  );

  return (
    <div ref={setRoot} className="relative w-full h-full bg-[#ffe3ef] overflow-hidden">
      {root && (
        <Canvas
          /* the DOM page-scroller sits on top of the canvas, so listen on the shared root
             and let three.js raycast from the client coordinates — this is what makes
             the cake clickable through the transparent hero section */
          eventSource={root}
          eventPrefix="client"
          /* nothing animates behind the envelope — and nothing is visible once the page is scrolled
             past the hero — so don't burn the GPU (or the phone battery) on frames nobody sees */
          frameloop={phase === "loading" || phase === "intro" || heroGone ? "demand" : "always"}
          dpr={profile.dpr}
          /* soft shadow maps stay enabled; the key light decides (per quality tier) whether it casts.
             `flat` = no tone mapping: the pastel palette stays exactly as authored */
          shadows="soft"
          flat
          camera={{ fov: 42, position: [4.2, 3.4, 7], near: 0.1, far: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            stencil: false,
            powerPreference: "high-performance",
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          {config && <Experience config={config} />}
          <Effects />
          <PerfGuard />
        </Canvas>
      )}

      {/* soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(140,26,84,0.18) 100%)",
        }}
      />

      {/* scrollable page: hero(3D) -> letter -> memories -> gifts.
          fully hidden while the candle ceremony plays out */}
      <div
        ref={scrollRef}
        id="page-scroller"
        aria-hidden={inCeremony}
        onScroll={(e) => {
          const el = e.currentTarget;
          const y = el.scrollTop / Math.max(el.clientHeight, 1);
          scrollState.y = y;
          useParty.getState().setScrolled(y > 0.25);
          useParty.getState().setHeroGone(y > 1.02);
        }}
        className={`absolute inset-0 z-20 overflow-y-auto overflow-x-hidden scroll-pink snap-y snap-proximity overscroll-none transition-opacity duration-500 ease-out ${
          inCeremony ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {config && <ScrollSections config={config} />}
      </div>

      {config && <Hud config={config} />}
      {config && phase === "intro" && <Envelope config={config} />}

      {/* loading */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[linear-gradient(168deg,#ffc4dc_0%,#ff9ec6_55%,#f97fb4_100%)]">
          <div className="w-16 h-16 rounded-full bg-white/90 soft-shadow-sm flex items-center justify-center text-punch-deep anim-heart">
            <HeartIcon className="w-8 h-8" />
          </div>
          <p className="font-display font-extrabold text-[#4a0f2f] text-xl md:text-2xl">
            {loadingText}
          </p>
        </div>
      )}

      {/* the heart that swallowed the screen melts away → the party is revealed.
          rendered in the same commit that switches the phase, so there is no flash in between */}
      {enteredAt !== null && !revealDone && (
        <div
          className="pointer-events-none absolute inset-0 z-[55]"
          style={
            {
              background: "#ff6aa9",
              animation: "revealOut 1200ms ease-out forwards",
            } as CSSProperties
          }
          onAnimationEnd={() => setRevealDone(true)}
        />
      )}

      {/* syntax error in config.json while editing (author-only: dev server or ?debug) */}
      {DEBUG && error && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[80] max-w-[92vw] -translate-x-1/2 rounded-xl bg-[#3a0d24]/92 px-4 py-2 text-center text-xs font-medium text-white shadow-lg">
          {error} — đang giữ nội dung cũ
        </div>
      )}
    </div>
  );
}
