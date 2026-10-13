import { useEffect, useMemo, useState } from "react";
import { makeT, type PartyConfig, type TFn } from "../config";
import { useParty, CEREMONY } from "../store";
import {
  HeartIcon, CalendarIcon, PinIcon, ClockIcon, FlameIcon,
  MatchIcon, WindIcon, ChevronDownIcon, SparkIcon, CakeIcon,
} from "./icons";

/* Everything in the HUD sits on a deep-plum "glass" chip (see .hud-chip in index.css):
   white text on it is ≥ 9:1 whatever the 3D scene looks like behind it, so it is readable on the
   pale-pink room, the hot-pink walls and the dark ceremony light alike. No backdrop-filter → free on the GPU. */

/* ---------- ceremony progress steps ---------- */
function CeremonySteps({ phase, charReady, steps }: { phase: string; charReady: boolean; steps: string[] }) {
  const idx =
    phase === "approach" ? (charReady ? 1 : 0) :
    phase === "blowing" ? 2 :
    phase === "blown" ? 3 : -1;
  if (idx < 0) return null;
  return (
    <ol className="hud-chip mb-2.5 gap-1.5 rounded-full px-3.5 py-2 md:gap-2.5 md:px-5">
      {steps.map((s, i) => (
        <li
          key={`${i}-${s}`}
          aria-current={i === idx ? "step" : undefined}
          className={`flex items-center gap-1.5 font-display font-bold text-[13px] leading-none md:text-[15px] transition-colors duration-500 ${
            i === idx ? "text-white" : i < idx ? "text-white/85" : "text-white/65"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-500 ${
              i === idx ? "bg-butter anim-heart" : i < idx ? "bg-white/85" : "bg-white/35"
            }`}
          />
          {/* on very narrow phones only the current step keeps its label, so the row never overflows */}
          <span className={i === idx ? "" : "hidden min-[400px]:inline"}>{s}</span>
          {i < steps.length - 1 && (
            <span className={`ml-0.5 h-0.5 w-2.5 rounded-full md:w-4 ${i < idx ? "bg-white/70" : "bg-white/25"}`} />
          )}
        </li>
      ))}
    </ol>
  );
}

function CeremonyHint({ phase, charReady, T }: { phase: string; charReady: boolean; T: TFn }) {
  const line = (icon: React.ReactNode, text: string) => (
    <div className="hud-chip hud-hint anim-rise rounded-[22px] px-4 py-2.5 text-[15px] font-semibold md:px-5 md:text-[17px]">
      {icon}
      <span>{text}</span>
    </div>
  );
  const ic = "h-5 w-5 shrink-0 text-butter md:h-6 md:w-6";
  if (phase === "approach" && !charReady) return line(<HeartIcon className={`${ic} anim-heart`} />, T("approaching"));
  if (phase === "approach" && charReady) return line(<WindIcon className={ic} />, T("tapToBlow"));
  if (phase === "blowing") return line(<WindIcon className={`${ic} anim-bob`} />, T("blowingNow"));
  if (phase === "blown") return line(<MatchIcon className={ic} />, T("tapToRelight"));
  if (phase === "relight") return line(<FlameIcon className={`${ic} anim-heart`} />, T("relighting"));
  return null;
}

/** the HUD is click-through, so the wheel would stop working while the pointer rests on the cue: pass it on */
function forwardWheel(e: React.WheelEvent) {
  document.getElementById("page-scroller")?.scrollBy({ top: e.deltaY });
}

function goToLetter() {
  const sc = document.getElementById("page-scroller");
  const el = document.getElementById("sec-letter");
  if (!sc || !el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  sc.scrollTo({ top: el.offsetTop, behavior: reduce ? "auto" : "smooth" });
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
  const eventChip = "hud-chip hud-chip--soft gap-1.5 rounded-2xl px-3 py-1.5 text-[14px] font-semibold md:text-[15px]";

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
        {/* top bar: greeting + age (left) · date / time / place (right) */}
        <div
          className={`absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))] md:px-6 md:pt-6 transition-all duration-500 ${
            infoHidden ? "opacity-0 -translate-y-4" : "opacity-100"
          }`}
        >
          <div className="hud-chip min-w-0 max-w-[34rem] gap-2.5 rounded-[22px] px-3.5 py-2.5 md:px-4">
            <HeartIcon className="h-6 w-6 shrink-0 text-candy anim-heart" />
            <div className="min-w-0">
              <p className="font-display text-[16px] font-extrabold leading-tight md:text-[19px]">
                {T("hudGreeting")}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-display text-[14px] font-bold leading-tight text-[#ffe3a3] md:text-[16px]">
                <SparkIcon className="h-4 w-4 shrink-0" />
                {T("hudAge")}
              </p>
            </div>
          </div>

          {(event.date || event.time || event.place) && (
            <div className="flex max-w-[44%] shrink-0 flex-col items-end gap-1.5 md:max-w-[22rem]">
              {event.date && (
                <p className={eventChip}>
                  <CalendarIcon className="h-4 w-4 shrink-0" /> {event.date}
                </p>
              )}
              {event.time && (
                <p className={eventChip}>
                  <ClockIcon className="h-4 w-4 shrink-0" /> {event.time}
                </p>
              )}
              {event.place && (
                <p className={eventChip}>
                  <PinIcon className="h-4 w-4 shrink-0" /> {event.place}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ceremony: one short sentence at the top */}
        {inCeremony && hint && (
          <div className="absolute inset-x-0 top-[max(14px,env(safe-area-inset-top))] flex justify-center px-3 md:top-6">
            <div
              key={phase}
              className="hud-chip hud-chip--soft anim-rise max-w-[36rem] rounded-[22px] px-4 py-2.5 text-center text-[15px] font-semibold md:px-5 md:text-[17px]"
              style={{ animationDelay: "220ms" }}
            >
              {hint}
            </div>
          </div>
        )}

        {/* party hero: the cake is the control (the caption is not a button) + the scroll-to-letter cue */}
        <div
          className={`absolute inset-x-0 bottom-[max(16px,calc(env(safe-area-inset-bottom)+12px))] flex flex-col items-center gap-3 px-3 transition-all duration-500 [@media(max-height:520px)]:flex-row [@media(max-height:520px)]:justify-center ${
            partyHero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="hud-chip hud-chip--soft rounded-[22px] px-4 py-2 text-center text-[15px] font-semibold md:text-[17px]">
            <CakeIcon className="h-5 w-5 shrink-0 text-butter anim-heart md:h-6 md:w-6" />
            <span>{T("tapCake")}</span>
          </div>

          <button
            type="button"
            onClick={goToLetter}
            onWheel={forwardWheel}
            disabled={!partyHero}
            tabIndex={partyHero ? 0 : -1}
            aria-hidden={!partyHero}
            aria-label={T("scrollHint")}
            className={`scroll-cue ${partyHero ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <span>{T("scrollHint")}</span>
            <span className="scroll-cue__chevs" aria-hidden>
              <ChevronDownIcon className="cue-chev h-5 w-5" />
              <ChevronDownIcon className="cue-chev h-5 w-5" />
            </span>
          </button>
        </div>

        {/* ceremony dock: progress steps + one short instruction */}
        <div
          className={`absolute bottom-0 inset-x-0 flex flex-col items-center px-3 pb-[max(18px,env(safe-area-inset-bottom))] transition-all duration-500 ${
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
