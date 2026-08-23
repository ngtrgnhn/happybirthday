import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { loadConfig, PartyConfig } from "./config";
import { useParty, CEREMONY } from "./store";
import { Experience } from "./scene/Experience";
import { scrollState } from "./scene/CameraRig";
import { Envelope } from "./ui/Envelope";
import { Hud } from "./ui/Hud";
import { ScrollSections } from "./ui/ScrollSections";
import { HeartIcon } from "./ui/icons";

export default function App() {
  const [config, setConfig] = useState<PartyConfig | null>(null);
  const phase = useParty((s) => s.phase);
  const burst = useParty((s) => s.burst);
  const [flash, setFlash] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const fontsReady: Promise<unknown> =
      (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ??
      Promise.resolve();
    // wait for display fonts so canvas-painted banner / age tag text is crisp
    Promise.all([loadConfig(), fontsReady]).then(([c]) => {
      if (!alive) return;
      setConfig(c);
      useParty.setState({ phase: "intro" });
    });
    return () => {
      alive = false;
    };
  }, []);

  /* white flash when the party doors open */
  useEffect(() => {
    if (phase === "party" && burst === 1) setFlash((f) => f + 1);
  }, [phase, burst]);

  /* ceremony: pin the page on the 3D scene */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (CEREMONY.includes(phase)) {
      el.scrollTo({ top: 0, behavior: "smooth" });
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = "";
    }
  }, [phase]);

  return (
    <div className="relative w-full h-full bg-[#ffe3ef] overflow-hidden">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 42, position: [4.2, 3.4, 7], near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {config && <Experience config={config} />}
      </Canvas>

      {/* soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(140,26,84,0.18) 100%)",
        }}
      />

      {/* scrollable page: hero(3D) -> letter -> memories -> gifts */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          scrollState.y = el.scrollTop / Math.max(el.clientHeight, 1);
        }}
        className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden scroll-pink"
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
          <p className="font-display font-bold text-white text-lg text-soft-shadow">
            Đang chuẩn bị bánh kem...
          </p>
        </div>
      )}

      {/* party-open flash */}
      {flash > 0 && (
        <div
          key={flash}
          className="pointer-events-none absolute inset-0 z-[55] bg-white"
          style={{ animation: "flashOut 800ms ease-out forwards" }}
        />
      )}

    </div>
  );
}
