import { useEffect, useMemo, useState } from "react";
import { makeT, type PartyConfig, type TFn } from "../config";
import { useParty, CEREMONY } from "../store";
import {
  HeartIcon, CalendarIcon, PinIcon, ClockIcon, FlameIcon,
  MatchIcon, WindIcon, ChevronDownIcon, SparkIcon, CakeIcon,
} from "./icons";

/* ---------- ceremony progress steps ---------- */
function CeremonySteps({ phase, charReady, steps }: { phase: string; charReady: boolean; steps: string[] }) {
  const idx =
    phase === "approach" ? (charReady ? 1 : 0) :
    phase === "blowing" ? 2 :
    phase === "blown" ? 3 : -1;
  if (idx < 0) return null;
  return (
    <div className="mb-3 flex items-center justify-center gap-3">
      {steps.map((s, i) => (
        <span key={`${i}-${s}`} className="flex items-center gap-3">
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

function Line({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex items-center gap-2 anim-rise">{children}</div>;
}

function CeremonyHint({ phase, charReady, T }: { phase: string; charReady: boolean; T: TFn }) {
  const text = "font-body text-sm text-white font-medium text-soft-shadow";
  if (phase === "approach" && !charReady)
    return (
      <Line>
        <HeartIcon className="w-5 h-5 text-white anim-heart" />
        <span className={text}>{T("approaching")}</span>
      </Line>
    );
  if (phase === "approach" && charReady)
    return (
      <Line>
        <WindIcon className="w-5 h-5 text-white" />
        <span className={text}>{T("tapToBlow")}</span>
      </Line>
    );
  if (phase === "blowing")
    return (
      <Line>
        <WindIcon className="w-5 h-5 text-white anim-bob" />
        <span className={text}>{T("blowingNow")}</span>
      </Line>
    );
  if (phase === "blown")
    return (
      <Line>
        <MatchIcon className="w-5 h-5 text-white" />
        <span className={text}>{T("tapToRelight")}</span>
      </Line>
    );
  if (phase === "relight")
    return (
      <Line>
        <FlameIcon className="w-5 h-5 text-white anim-heart" />
        <span className={text}>{T("relighting")}</span>
      </Line>
    );
  return null;
}

export function Hud({ config }: { config: PartyConfig }) {
  const phase = useParty((s) => s.phase);
  const charReady = useParty((s) => s.charReady);
  const scrolled = useParty((s) => s.scrolled);
  const douse = useParty((s) => s.douse);
  const [flash, setFlash] = useState(0);
  const T = useMemo(() => makeT(config), [config]);

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

  const { event } = config;
  const infoHidden = inCeremony || scrolled;
  const partyHero = phase === "party" && !scrolled;

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
            infoHidden ? "opacity-0 -translate-x-5" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 -rotate-1">
            <HeartIcon className="w-5 h-5 text-white anim-heart" />
            <span className="font-display font-bold text-white text-sm md:text-base text-soft-shadow">
              {T("hudGreeting")}
            </span>
          </div>
          <div className="mt-1 ml-7 flex items-center gap-1.5">
            <SparkIcon className="w-3.5 h-3.5 text-butter" />
            <span className="font-display font-bold text-xs md:text-sm text-white/90 text-soft-shadow">
              {T("hudAge")}
            </span>
          </div>
        </div>

        {/* top-right: event info (only the lines that have content) */}
        <div
          className={`absolute top-4 right-4 md:top-6 md:right-6 transition-all duration-500 ${
            infoHidden ? "opacity-0 translate-x-5" : "opacity-100"
          }`}
        >
          <div className="rotate-1 text-right">
            {event.date && (
              <p className="flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-white/90 text-soft-shadow">
                <CalendarIcon className="w-3.5 h-3.5" /> {event.date}
              </p>
            )}
            {event.time && (
              <p className="mt-1 flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-white/90 text-soft-shadow">
                <ClockIcon className="w-3.5 h-3.5" /> {event.time}
              </p>
            )}
            {event.place && (
              <p className="mt-1 flex items-center justify-end gap-1.5 font-body font-semibold text-[11px] md:text-xs text-white/90 text-soft-shadow">
                <PinIcon className="w-3.5 h-3.5" /> {event.place}
              </p>
            )}
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

        {/* party hero: the cake is the control — this is only a caption, not a button */}
        <div
          className={`absolute inset-x-0 bottom-[max(26px,calc(env(safe-area-inset-bottom)+22px))] flex justify-center px-4 transition-all duration-500 ${
            partyHero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2" style={{ animationDelay: "900ms" }}>
            <CakeIcon className="w-5 h-5 text-white anim-heart" />
            <span className="font-display font-bold text-sm md:text-base text-white text-soft-shadow">
              {T("tapCake")}
            </span>
          </div>
        </div>

        {/* bottom-right: scroll-to-letter cue (only when freely browsing the hero) */}
        <div
          className={`absolute bottom-[max(26px,calc(env(safe-area-inset-bottom)+22px))] right-4 md:right-6 transition-all duration-500 ${
            partyHero ? "opacity-100" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            <span className="font-display font-bold text-xs md:text-sm text-soft-shadow">
              {T("scrollHint")}
            </span>
            <span className="anim-bob text-butter"><ChevronDownIcon className="w-6 h-6" /></span>
          </div>
        </div>

        {/* ceremony dock: progress steps + one short instruction */}
        <div
          className={`absolute bottom-0 inset-x-0 flex flex-col items-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] transition-all duration-500 ${
            inCeremony ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {inCeremony && <CeremonySteps phase={phase} charReady={charReady} steps={config.ui.steps} />}
          <CeremonyHint phase={phase} charReady={charReady} T={T} />
        </div>
      </div>
    </>
  );
}
