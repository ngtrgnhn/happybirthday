import { useEffect, useState } from "react";
import type { PartyConfig } from "../config";
import { useParty, CEREMONY } from "../store";
import {
  HeartIcon, CalendarIcon, PinIcon, FlameIcon,
  MatchIcon, WindIcon, ChevronDownIcon, SparkIcon,
} from "./icons";



/* ---------- ceremony progress steps ---------- */
function CeremonySteps({ phase, charReady }: { phase: string; charReady: boolean }) {
  const steps = ["lại gần", "cầu nguyện", "thổi nến", "điều ước"];
  const idx =
    phase === "approach" ? (charReady ? 1 : 0) :
    phase === "blowing" ? 2 :
    phase === "blown" ? 3 : -1;
  if (idx < 0) return null;
  return (
    <div className="mb-3 flex items-center justify-center gap-3">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 font-display font-bold text-[11px] uppercase tracking-wide transition-all duration-400 ${
              i === idx
                ? "text-white scale-105"
                : i < idx
                ? "text-white/60"
                : "text-white/40"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                i === idx ? "bg-white anim-heart" : i < idx ? "bg-white/60" : "bg-white/30"
              }`}
            />
            {s}
          </span>
          {i < steps.length - 1 && (
            <span className={`h-px w-4 ${i < idx ? "bg-white/50" : "bg-white/20"}`} />
          )}
        </span>
      ))}
    </div>
  );
}

export function Hud({ config }: { config: PartyConfig }) {
  const phase = useParty((s) => s.phase);
  const charReady = useParty((s) => s.charReady);
  const requestBlow = useParty((s) => s.requestBlow);
  const requestRelight = useParty((s) => s.requestRelight);
  const douse = useParty((s) => s.douse);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!douse) return;
    setFlash((f) => f + 1);
  }, [douse]);

  if (phase === "loading" || phase === "intro") return null;

  const inCeremony = CEREMONY.includes(phase);
  const hint =
    phase === "approach" ? config.hints.approach :
    phase === "blowing" ? config.hints.blowing :
    phase === "blown" ? config.hints.blown :
    phase === "relight" ? config.hints.relight : "";

  return (
    <>
      {/* dark flash the moment every flame dies */}
      {flash > 0 && (
        <div
          key={flash}
          className="pointer-events-none absolute inset-0 z-50 bg-[#3a0d24]"
          style={{ animation: "douseFlash 900ms ease-out forwards" }}
        />
      )}

      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* top-left: recipient info */}
        <div
          className={`absolute top-4 left-4 md:top-6 md:left-6 transition-all duration-500 ${
            inCeremony ? "opacity-0 -translate-x-5 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 -rotate-1">
            <HeartIcon className="w-5 h-5 text-white anim-heart" />
            <span className="font-display font-bold text-white text-sm md:text-base text-soft-shadow">
              Chúc mừng sinh nhật {config.recipient.name}
            </span>
          </div>
          <div className="mt-1 ml-7 flex items-center gap-1.5">
            <SparkIcon className="w-3.5 h-3.5 text-butter" />
            <span className="font-display font-bold text-xs md:text-sm text-white/90 text-soft-shadow">
              tròn {config.recipient.age} tuổi
            </span>
          </div>
        </div>

        {/* top-right: event info */}
        <div
          className={`absolute top-4 right-4 md:top-6 md:right-6 transition-all duration-500 ${
            inCeremony ? "opacity-0 translate-x-5 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="rotate-1 text-right">
            <p className="flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-white/90">
              <CalendarIcon className="w-3.5 h-3.5" /> {config.event.date}
            </p>
            <p className="flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-white/90 mt-1">
              <PinIcon className="w-3.5 h-3.5" /> {config.event.place}
            </p>
          </div>
        </div>

        {/* hint bar */}
        {inCeremony && hint && (
          <div className="absolute top-16 md:top-20 inset-x-0 flex justify-center px-4">
            <div
              key={phase}
              className="anim-rise text-white font-body font-medium text-xs md:text-sm text-center text-soft-shadow"
            >
              {hint}
            </div>
          </div>
        )}

        {/* bottom-right: scroll-to-letter pill (only when freely browsing) */}
        {phase === "party" && (
          <div className="absolute bottom-[max(88px,calc(env(safe-area-inset-bottom)+84px))] right-4 md:right-6 anim-rise" style={{ animationDelay: "400ms" }}>
            <div className="flex flex-col items-center gap-1 text-white">
              <span className="font-display font-bold text-xs md:text-sm text-soft-shadow">
                Cuộn xuống đọc thư
              </span>
              <span className="anim-bob text-butter"><ChevronDownIcon className="w-6 h-6" /></span>
            </div>
          </div>
        )}



        {/* action dock - chỉ hiển thị ceremony steps và hint */}
        <div
          className={`absolute bottom-0 inset-x-0 flex flex-col items-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] transition-all duration-500 ${
            inCeremony || phase === "party" ? "opacity-100 translate-y-0 pointer-events-none" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          {inCeremony && <CeremonySteps phase={phase} charReady={charReady} />}
          
          {/* Hint text đơn giản - không có background */}
          {phase === "approach" && !charReady && (
            <div className="mt-3 flex items-center gap-2 anim-rise">
              <HeartIcon className="w-5 h-5 text-white anim-heart" />
              <span className="font-body text-sm text-white font-medium text-soft-shadow">cô bé đang tới...</span>
            </div>
          )}
          {phase === "approach" && charReady && (
            <div className="mt-3 flex items-center gap-2 anim-rise">
              <WindIcon className="w-5 h-5 text-white" />
              <span className="font-body text-sm text-white font-medium text-soft-shadow">nhấn vào bánh kem để thổi nến</span>
            </div>
          )}
          {phase === "blowing" && (
            <div className="mt-3 flex items-center gap-2 anim-rise">
              <WindIcon className="w-5 h-5 text-white anim-bob" />
              <span className="font-body text-sm text-white font-medium text-soft-shadow">hít sâu... thổi!</span>
            </div>
          )}
          {phase === "blown" && (
            <div className="mt-3 flex items-center gap-2 anim-rise">
              <MatchIcon className="w-5 h-5 text-white" />
              <span className="font-body text-sm text-white font-medium text-soft-shadow">nhấn vào bánh kem để thắp lại nến</span>
            </div>
          )}
          {phase === "relight" && (
            <div className="mt-3 flex items-center gap-2 anim-rise">
              <FlameIcon className="w-5 h-5 text-white anim-heart" />
              <span className="font-body text-sm text-white font-medium text-soft-shadow">đang thắp nến...</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
