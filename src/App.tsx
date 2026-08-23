import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { loadConfig, type PartyConfig } from "./config";
import { useParty } from "./store";
import { Experience } from "./scene/Experience";
import { Envelope } from "./ui/Envelope";
import { Hud } from "./ui/Hud";
import { HeartIcon } from "./ui/icons";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-[linear-gradient(168deg,#ff8fc0_0%,#ff5c9e_55%,#e63f85_100%)]">
      <div className="anim-pop">
        <span className="cut block bg-ink p-[3px]">
          <span className="cut block bg-paper w-20 h-20 flex items-center justify-center text-punch-deep" style={{ animation: "pulseGlow 1.6s ease-out infinite" }}>
            <HeartIcon className="w-10 h-10" />
          </span>
        </span>
      </div>
      <p className="font-display font-bold uppercase tracking-[0.24em] text-paper text-sm anim-hint">
        Đang bày tiệc...
      </p>
    </div>
  );
}

function EnterFlash() {
  const phase = useParty((s) => s.phase);
  const [flash, setFlash] = useState(false);
  const prev = useRef(phase);

  useEffect(() => {
    if (phase === "party" && prev.current === "intro") {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 950);
      prev.current = phase;
      return () => clearTimeout(t);
    }
    prev.current = phase;
  }, [phase]);

  if (!flash) return null;
  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none bg-paper"
      style={{ animation: "flashOut 0.95s ease-out forwards" }}
    />
  );
}

export default function App() {
  const [config, setConfig] = useState<PartyConfig | null>(null);
  const phase = useParty((s) => s.phase);

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

  return (
    <div className="relative w-full h-full overflow-hidden bg-blush">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 42, position: [4.2, 3.4, 7], near: 0.1, far: 45 }}
        style={{ position: "absolute", inset: 0 }}
      >
        {config && <Experience config={config} />}
      </Canvas>

      {/* soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(140,26,84,0.20) 100%)",
        }}
      />

      {config && phase === "intro" && <Envelope config={config} />}
      {config && phase !== "intro" && phase !== "loading" && <Hud config={config} />}

      <EnterFlash />
      {!config && <LoadingScreen />}
    </div>
  );
}
